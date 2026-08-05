// Verifica a saúde dos links do Compêndio.
//
// Uso:  npm run links:checar
//
// Existe porque todo o Compêndio depende de links externos: se a hospedagem
// sair do ar, o app não percebe — as páginas continuam abrindo e só o clique
// falha. Rodar isto de tempos em tempos transforma uma quebra silenciosa em
// algo detectável. Sai com código 1 se algum link falhar, então serve em CI.

import { categoriasLivros } from "../lib/data/livros.ts";

const TIMEOUT_MS = 20000;
const LOTE = 8;

const todos = categoriasLivros.flatMap((categoria) =>
  categoria.livros.map((livro) => ({ categoria: categoria.nome, ...livro })),
);

console.log(`Checando ${todos.length} links do Compêndio…\n`);

const resultados = [];
for (let i = 0; i < todos.length; i += LOTE) {
  await Promise.all(
    todos.slice(i, i + LOTE).map(async (livro) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      try {
        const resposta = await fetch(livro.url, {
          redirect: "follow",
          signal: ctrl.signal,
        });
        resultados.push({ ...livro, status: resposta.status, ok: resposta.ok });
      } catch (e) {
        resultados.push({
          ...livro,
          status: e.name === "AbortError" ? "timeout" : "erro de rede",
          ok: false,
        });
      } finally {
        clearTimeout(timer);
      }
    }),
  );
  process.stdout.write(".");
}
console.log("\n");

// A concentração num único host é o risco principal — mostrar sempre.
const porHost = {};
for (const r of resultados) {
  const host = new URL(r.url).host;
  porHost[host] = (porHost[host] ?? 0) + 1;
}

console.log("Concentração por host:");
for (const [host, n] of Object.entries(porHost).sort((a, b) => b[1] - a[1])) {
  const pct = ((n / resultados.length) * 100).toFixed(0);
  console.log(`  ${host.padEnd(26)} ${String(n).padStart(3)} livros  (${pct}%)`);
}

const ruins = resultados.filter((r) => !r.ok);
console.log(`\nRespondendo: ${resultados.length - ruins.length}/${resultados.length}`);

if (ruins.length > 0) {
  console.log("\nCom problema:");
  for (const r of ruins) {
    console.log(`  [${r.status}] ${r.categoria} — ${r.titulo}`);
    console.log(`           ${r.url}`);
  }
}

process.exitCode = ruins.length > 0 ? 1 : 0;
