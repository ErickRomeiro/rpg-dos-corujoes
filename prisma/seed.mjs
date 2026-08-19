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
//
// O que este script NÃO faz é apagar. Item renomeado nas tabelas vira linha
// nova aqui e a antiga fica para trás — quem varre isso é o
// scripts/limpar-catalogo.mjs, que mostra antes de remover. Os dois montam o
// catálogo pela mesma função, em catalogo.mjs, para não discordarem.

import pg from "pg";
import { SISTEMA, FONTE, carregarEnv, montarLinhas } from "./catalogo.mjs";

carregarEnv();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const linhas = montarLinhas();
  console.log(`Semeando ${linhas.length} itens do ${FONTE}…`);

  let criados = 0;
  let atualizados = 0;

  for (const { tipo, nome, dados, fonte } of linhas) {
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
        [JSON.stringify(dados), fonte, existente.rows[0].id],
      );
      atualizados++;
    } else {
      await client.query(
        `INSERT INTO "ItemCatalogo"
           (id, sistema, tipo, nome, dados, fonte, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2::"TipoCatalogo", $3, $4, $5, now(), now())`,
        [SISTEMA, tipo, nome, JSON.stringify(dados), fonte],
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
