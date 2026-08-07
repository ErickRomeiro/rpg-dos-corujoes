// Remove do catálogo oficial as linhas que as tabelas de lib/dnd35 não geram
// mais — sobra de item renomeado ou removido, que o seed deixa para trás
// porque ele nunca apaga.
//
// Uso:  npm run catalogo:limpar            mostra o que sobrou, não apaga
//       npm run catalogo:limpar -- --apagar  apaga de verdade
//
// Só toca em linha oficial (mesaId IS NULL) do sistema dnd35. Homebrew de
// mesa nunca entra na conta, nem para listar.
//
// O catálogo esperado vem da mesma função que o seed usa, em
// prisma/catalogo.mjs. Isso é de propósito: se a limpeza tivesse a própria
// cópia e alguém acrescentasse uma tabela só no seed, ela apagaria as linhas
// novas por não conhecê-las.

import pg from "pg";
import {
  SISTEMA,
  carregarEnv,
  montarLinhas,
  renomeadosPorTipo,
} from "../prisma/catalogo.mjs";

const apagar = process.argv.includes("--apagar");
carregarEnv();

const esperadas = new Set(montarLinhas().map((l) => `${l.tipo} ${l.nome}`));
const renomeados = renomeadosPorTipo();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const { rows } = await client.query(
    `SELECT id, tipo, nome FROM "ItemCatalogo"
      WHERE sistema = $1 AND "mesaId" IS NULL
      ORDER BY tipo, nome`,
    [SISTEMA],
  );

  const noBanco = new Set(rows.map((r) => `${r.tipo} ${r.nome}`));
  const sobrando = rows.filter((r) => !esperadas.has(`${r.tipo} ${r.nome}`));
  const faltando = [...esperadas].filter((e) => !noBanco.has(e));

  console.log(`Catálogo oficial no banco: ${rows.length} linhas.`);
  console.log(`As tabelas geram: ${esperadas.size}.`);

  if (sobrando.length === 0) {
    console.log("\nNada sobrando — o banco bate com as tabelas.");
    process.exit(0);
  }

  // A linha que substitui a renomeada só passa a existir depois do seed.
  // Apagar antes deixaria o catálogo sem o item, em vez de com ele sob o nome
  // novo — então isto é verificado, não suposto.
  const semSubstituto = [];
  console.log(`\n${sobrando.length} linhas não são mais geradas:\n`);
  let renomeadas = 0;
  for (const r of sobrando) {
    const novo = renomeados[r.tipo]?.get(r.nome);
    let porque;
    if (!novo) {
      porque = "não existe mais nas tabelas";
    } else {
      renomeadas++;
      if (noBanco.has(`${r.tipo} ${novo}`)) {
        porque = `renomeado para "${novo}", que já está no banco`;
      } else {
        semSubstituto.push(r);
        porque = `renomeado para "${novo}", que AINDA NÃO está no banco`;
      }
    }
    console.log(`  ${r.tipo.padEnd(9)} ${r.nome.padEnd(38)} ${porque}`);
  }

  console.log(
    `\n  ${renomeadas} são renomeações e ${sobrando.length - renomeadas} sumiram de vez.`,
  );
  if (faltando.length) {
    console.log(`  ${faltando.length} linhas que as tabelas geram ainda não estão no banco.`);
  }
  if (semSubstituto.length) {
    console.log(
      `\n  ATENÇÃO: ${semSubstituto.length} renomeações ainda não têm a linha nova no banco.` +
        "\n  Rode `npm run db:seed` antes de apagar, senão o catálogo fica sem esses itens.",
    );
  }

  if (!apagar) {
    console.log("\nNada foi apagado. Para remover, rode com --apagar.");
    process.exit(0);
  }

  if (semSubstituto.length) {
    console.log("\nNão apago com renomeação pendente. Rode o seed primeiro.");
    process.exit(1);
  }

  const ids = sobrando.map((r) => r.id);
  const { rowCount } = await client.query(
    `DELETE FROM "ItemCatalogo" WHERE id = ANY($1::text[]) AND "mesaId" IS NULL`,
    [ids],
  );
  console.log(`\n${rowCount} linhas removidas.`);
} finally {
  await client.end();
}
