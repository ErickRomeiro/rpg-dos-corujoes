import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/permissoes";
import { lerDados } from "@/lib/ficha";

export const metadata: Metadata = { title: "Fichas · D&D 3.5" };

const SISTEMA = "dnd35";

export default async function FichasPage() {
  const user = await usuarioAtual();
  if (!user) return null;

  const fichas = await prisma.ficha.findMany({
    where: { userId: user.id, sistema: SISTEMA },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📜 Minhas fichas</h1>
          <p className="mt-2 text-muted">
            Seus personagens de D&amp;D 3.5. Use-os para entrar nas mesas.
          </p>
        </div>
        <Link
          href="/dnd35/fichas/nova"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-strong"
        >
          + Nova ficha
        </Link>
      </header>

      {fichas.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
          Você ainda não tem personagens. Crie o primeiro com “+ Nova ficha”.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fichas.map((ficha) => {
            const d = lerDados(ficha.dados);
            const resumo = [d.raca, d.classeNivel].filter(Boolean).join(" · ");
            return (
              <li key={ficha.id}>
                <Link
                  href={`/dnd35/fichas/${ficha.id}`}
                  className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/50 hover:bg-surface-2"
                >
                  <h2 className="text-lg font-semibold tracking-tight">
                    {ficha.nome}
                  </h2>
                  <p className="mt-1 flex-1 text-sm text-muted">
                    {resumo || "Personagem sem detalhes ainda"}
                  </p>
                  {d.alinhamento && (
                    <span className="mt-3 inline-block w-fit rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                      {d.alinhamento}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
