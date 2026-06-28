import type { Metadata } from "next";
import { categoriasLivros, totalLivros } from "@/lib/data/livros";

export const metadata: Metadata = {
  title: "Compêndio · D&D 3.5",
  description:
    "Biblioteca completa de livros de D&D 3.5: núcleo, suplementos, Forgotten Realms e mais.",
};

export default function CompendioPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">📚 Compêndio</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Biblioteca com {totalLivros} livros de D&amp;D 3.5. Os dados
          estruturados (raças, classes, magias) serão adicionados aos poucos —
          por enquanto, acesse os livros diretamente.
        </p>
      </header>

      {/* Índice de categorias */}
      <nav aria-label="Categorias" className="mb-10 flex flex-wrap gap-2">
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
            <h2 className="text-xl font-semibold tracking-tight">
              {categoria.nome}
              <span className="ml-2 text-sm font-normal text-muted">
                ({categoria.livros.length})
              </span>
            </h2>
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
    </div>
  );
}
