// Carrega o conteúdo do SRD 3.5 para a tabela ItemCatalogo.
//
// Uso:  npm run db:seed
//
// É idempotente: roda quantas vezes quiser. Cada item é identificado por
// (sistema, tipo, nome, mesaId=null) e sofre upsert — o que já existe é
// atualizado, o que é novo é criado. Homebrew das mesas (mesaId preenchido)
// nunca é tocado.
//
// A fonte da verdade continua sendo os arquivos em lib/dnd35/, versionados no
// git. O banco é a cópia consultável pelo app.

import { readFileSync } from "node:fs";
import pg from "pg";

for (const linha of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = linha.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^"|"$/g, "");
}

const SISTEMA = "dnd35";
const FONTE = "SRD 3.5";

// Os arquivos de dados são TypeScript só por causa dos tipos; o conteúdo é
// JSON puro. Lemos com o strip-types do Node para não duplicar as tabelas.
const { RACAS } = await import("../lib/dnd35/racas.ts");
const { CLASSES } = await import("../lib/dnd35/classes.ts");
const { ARMAS, ARMADURAS, ITENS_COMUNS } = await import("../lib/dnd35/equipamento.ts");
const { TALENTOS } = await import("../lib/dnd35/talentos.ts");

/** Monta as linhas do catálogo a partir das tabelas do SRD. */
function montarLinhas() {
  const linhas = [];
  const add = (tipo, nome, dados) => linhas.push({ tipo, nome, dados });

  for (const r of RACAS) add("RACA", r.nome, r);
  for (const c of CLASSES) add("CLASSE", c.nome, c);
  for (const a of ARMAS) add("ARMA", a.nome, a);
  for (const a of ARMADURAS) add("ARMADURA", a.nome, a);
  for (const t of TALENTOS) add("TALENTO", t.nome, t);
  for (const i of ITENS_COMUNS) add("ITEM", i.nome, i);

  return linhas;
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const linhas = montarLinhas();
  console.log(`Semeando ${linhas.length} itens do ${FONTE}…`);

  let criados = 0;
  let atualizados = 0;

  for (const { tipo, nome, dados } of linhas) {
    // `mesaId IS NULL` participa da unicidade, mas o Postgres não considera
    // NULLs iguais num índice único comum — então fazemos o upsert na mão.
    const existente = await client.query(
      `SELECT id FROM "ItemCatalogo"
        WHERE sistema = $1 AND tipo = $2::"TipoCatalogo" AND nome = $3 AND "mesaId" IS NULL`,
      [SISTEMA, tipo, nome],
    );

    if (existente.rows.length > 0) {
      await client.query(
        `UPDATE "ItemCatalogo"
            SET dados = $1, fonte = $2, "updatedAt" = now()
          WHERE id = $3`,
        [JSON.stringify(dados), FONTE, existente.rows[0].id],
      );
      atualizados++;
    } else {
      await client.query(
        `INSERT INTO "ItemCatalogo"
           (id, sistema, tipo, nome, dados, fonte, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2::"TipoCatalogo", $3, $4, $5, now(), now())`,
        [SISTEMA, tipo, nome, JSON.stringify(dados), FONTE],
      );
      criados++;
    }
  }

  const resumo = await client.query(
    `SELECT tipo, count(*)::int AS total
       FROM "ItemCatalogo"
      WHERE sistema = $1 AND "mesaId" IS NULL
      GROUP BY tipo ORDER BY tipo`,
    [SISTEMA],
  );

  console.log(`\n  ${criados} criados, ${atualizados} atualizados.\n`);
  console.log("  Catálogo oficial no banco:");
  for (const r of resumo.rows) console.log(`    ${r.tipo.padEnd(10)} ${r.total}`);
  console.log();
} finally {
  await client.end();
}
