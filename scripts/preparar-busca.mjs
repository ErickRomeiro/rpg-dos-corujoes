// Cria no banco a extensão que a busca do catálogo precisa.
//
// Uso:  npm run db:busca   (já roda dentro de `npm run db:push`)
//
// `buscarCatalogo` compara nome e apelidos com `unaccent()`, para "agua" achar
// "Água" e "nevoa" achar "Névoa" — sem isso a busca reprova em português, que
// é o idioma de todo o catálogo. A extensão não vem por padrão no Postgres e o
// `prisma db push` não a cria: ele sincroniza tabelas, não extensões. Como a
// consulta falha na hora se ela faltar, este script roda junto do push.
//
// É idempotente: `IF NOT EXISTS` faz rodar quantas vezes quiser.

import pg from "pg";
import { carregarEnv } from "../prisma/catalogo.mjs";

carregarEnv();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query("CREATE EXTENSION IF NOT EXISTS unaccent");

  // Confere de fato, em vez de confiar no comando ter passado: um banco
  // gerenciado pode aceitar o CREATE e instalar em outro schema, e aí a
  // consulta continuaria quebrando na primeira busca.
  const { rows } = await client.query(
    "SELECT extversion FROM pg_extension WHERE extname = 'unaccent'",
  );

  if (rows.length === 0) {
    console.error(
      "unaccent não ficou instalada. A busca do catálogo vai falhar.\n" +
        "Verifique se o usuário do banco tem permissão para criar extensões.",
    );
    process.exitCode = 1;
  } else {
    const teste = await client.query("SELECT unaccent('Água') AS u");
    console.log(
      `unaccent ${rows[0].extversion} pronta (unaccent('Água') = '${teste.rows[0].u}').`,
    );
  }
} catch (erro) {
  console.error("Não consegui preparar a busca:", erro.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
