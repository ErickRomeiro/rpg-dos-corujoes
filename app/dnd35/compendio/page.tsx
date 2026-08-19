// A capa do Compêndio: o catálogo de dados de jogo em cima, a biblioteca de
// livros embaixo.
//
// A ordem é essa porque o que se consulta no meio de uma sessão é uma magia ou
// um talento, não um PDF de 300 páginas. Os livros continuam aqui — são a
// fonte, e o que ainda não foi transcrito só existe lá.

import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { categoriasLivros, totalLivros } from "@/lib/data/livros";
import { SECOES, contarPorTipo } from "@/lib/compendio";

export const metadata: Metadata = {
  title: "Compêndio · D&D 3.5",
  description:
    "Magias, talentos, armas, classes e raças de D&D 3.5, mais a biblioteca completa de livros.",
};

export default async function CompendioPage() {
  // Sem isto a página é prerenderizada no build, e as contagens congelam no
  // que o banco tinha naquele instante: um `db:seed` depois do deploy não
  // apareceria aqui até alguém rebuildar. Como a página promete ser "o mesmo
  // catálogo que preenche a ficha", contar errado é justamente o que ela não
  // pode fazer. O custo é um `groupBy` por visita.
  await connection();

  const contagem = await contarPorTipo();
  // Seção sem nenhuma linha no banco não vira card: anunciar "Idiomas" e
  // entregar uma lista vazia seria pior do que não anunciar.
  const secoes = SECOES.filter((s) => (contagem.get(s.tipo) ?? 0) > 0);
  const total = [...contagem.values()].reduce((s, n) => s + n, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">📚 Compêndio</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {total} entradas de regra já transcritas, mais {totalLivros} livros
          para o que ainda não está. É o mesmo catálogo que preenche a ficha —
          consultar aqui e preencher lá não têm como divergir.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="text-xl font-semibold tracking-tight">Dados de jogo</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {secoes.map((secao) => {
            const n = contagem.get(secao.tipo) ?? 0;
            return (
              <li key={secao.slug}>
                <Link
                  href={`/dnd35/compendio/${secao.slug}`}
                  className="flex h-full items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
                >
                  <span aria-hidden className="text-xl">
                    {secao.icone}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {secao.rotulo}
                      <span className="ml-2 text-xs font-normal text-muted">
                        {n}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {secao.descricao}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight">Biblioteca</h2>
        <p className="mt-1 text-sm text-muted">
          Os livros completos, em PDF. É onde está o que as tabelas acima ainda
          não cobrem.
        </p>

        <nav aria-label="Categorias" className="mb-10 mt-4 flex flex-wrap gap-2">
          {categoriasLivros.map((categoria) => (
            <a
              key={categoria.id}
              href={`#${categoria.id}`}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-foreground"
            >
              {categoria.nome}
            </a>
          ))}
        </nav>

        <div className="space-y-12">
          {categoriasLivros.map((categoria) => (
            <section key={categoria.id} id={categoria.id} className="scroll-mt-20">
              <h3 className="text-lg font-semibold tracking-tight">
                {categoria.nome}
                <span className="ml-2 text-sm font-normal text-muted">
                  ({categoria.livros.length})
                </span>
              </h3>
              <p className="mt-1 text-sm text-muted">{categoria.descricao}</p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoria.livros.map((livro) => (
                  <li key={livro.url}>
                    <a
                      href={livro.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
                    >
                      <span aria-hidden className="text-xl">
                        📕
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium leading-snug">
                          {livro.titulo}
                        </span>
                        {livro.essencial && (
                          <span className="mt-1 inline-block rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                            Essencial
                          </span>
                        )}
                        <span className="mt-1 block text-xs text-muted">
                          PDF · abrir ↗
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
