import type { Metadata } from "next";
import Link from "next/link";
import { secoesDnd35 } from "@/lib/navegacao";
import { totalLivros } from "@/lib/data/livros";

export const metadata: Metadata = {
  title: "Dungeons & Dragons 3.5",
  description:
    "Sua mesa de D&D 3.5: fichas de personagem, compêndio de regras e ferramentas para jogadores e mestres.",
};

export default function Dnd35Hub() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-12 text-center sm:py-16">
        <Link
          href="/"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Todos os RPGs
        </Link>
        <div className="mt-6">
          <span aria-hidden className="text-6xl">
            🐉
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Dungeons &amp; Dragons <span className="text-accent">3.5</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Fichas de personagem, compêndio de regras e ferramentas para
          jogadores e mestres.
        </p>
      </section>

      {/* Seções */}
      <section className="grid gap-4 pb-12 sm:grid-cols-2">
        {secoesDnd35.map((secao) => (
          <Link
            key={secao.href}
            href={secao.href}
            className="group rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/50 hover:bg-surface-2"
          >
            <span aria-hidden className="text-3xl">
              {secao.icone}
            </span>
            <h2 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-accent">
              {secao.rotulo}
            </h2>
            <p className="mt-1 text-sm text-muted">{secao.descricao}</p>
          </Link>
        ))}
      </section>

      {/* Destaque do compêndio */}
      <section className="mb-20 rounded-xl border border-border bg-gradient-to-br from-surface to-surface-2 p-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight">
          Biblioteca com {totalLivros} livros de D&amp;D 3.5
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
          Núcleo, suplementos, Forgotten Realms e muito mais — tudo organizado e
          a um clique de distância.
        </p>
        <Link
          href="/dnd35/compendio"
          className="mt-5 inline-block text-sm font-medium text-accent hover:text-accent-strong"
        >
          Ver biblioteca completa →
        </Link>
      </section>

      <p className="mb-12 text-center text-xs text-muted">
        Dungeons &amp; Dragons e D&amp;D são marcas registradas da Wizards of the
        Coast. Este é um projeto de fãs, sem afiliação ou endosso.
      </p>
    </div>
  );
}
