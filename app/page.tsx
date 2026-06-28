import Link from "next/link";
import { rpgs } from "@/lib/data/rpgs";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-16 text-center sm:py-24">
        <span aria-hidden className="text-6xl">
          🦉
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          RPG dos <span className="text-accent">Corujões</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Suas mesas de RPG em um só lugar. Escolha um sistema para começar.
        </p>
      </section>

      {/* Vitrine de RPGs */}
      <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {rpgs.map((rpg) =>
          rpg.disponivel ? (
            <Link
              key={rpg.id}
              href={rpg.href}
              className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/50 hover:bg-surface-2"
            >
              <span aria-hidden className="text-4xl">
                {rpg.icone}
              </span>
              <h2 className="mt-4 text-xl font-semibold tracking-tight group-hover:text-accent">
                {rpg.nome}
              </h2>
              <p className="mt-1 flex-1 text-sm text-muted">{rpg.descricao}</p>
              <span className="mt-4 text-sm font-medium text-accent">
                Acessar →
              </span>
            </Link>
          ) : (
            <div
              key={rpg.id}
              className="flex flex-col rounded-xl border border-border bg-surface/50 p-6 opacity-70"
            >
              <span aria-hidden className="text-4xl grayscale">
                {rpg.icone}
              </span>
              <h2 className="mt-4 text-xl font-semibold tracking-tight">
                {rpg.nome}
              </h2>
              <p className="mt-1 flex-1 text-sm text-muted">{rpg.descricao}</p>
              <span className="mt-4 inline-block w-fit rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                Em breve
              </span>
            </div>
          ),
        )}
      </section>
    </div>
  );
}
