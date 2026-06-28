import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, ehDono } from "@/lib/permissoes";

export const metadata: Metadata = { title: "Mesas · D&D 3.5" };

const SISTEMA = "dnd35";

export default async function MesasPage() {
  const user = await usuarioAtual();
  if (!user) return null; // o proxy já garante login

  const dono = ehDono(user);
  const mesas = await prisma.mesa.findMany({
    where: dono
      ? { sistema: SISTEMA }
      : { sistema: SISTEMA, membros: { some: { userId: user.id } } },
    include: {
      _count: { select: { membros: true } },
      membros: { where: { userId: user.id }, select: { papel: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🗺️ Mesas</h1>
          <p className="mt-2 text-muted">
            {dono
              ? "Todas as mesas de D&D 3.5."
              : "As mesas de D&D 3.5 de que você participa."}
          </p>
        </div>
        {dono && (
          <Link
            href="/dnd35/mesas/nova"
            className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-strong"
          >
            + Nova mesa
          </Link>
        )}
      </header>

      {mesas.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
          {dono
            ? "Nenhuma mesa ainda. Crie a primeira com “+ Nova mesa”."
            : "Você ainda não está em nenhuma mesa. Peça ao mestre para te adicionar."}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {mesas.map((mesa) => {
            const meuPapel = mesa.membros[0]?.papel;
            const rotulo = meuPapel
              ? meuPapel === "MESTRE"
                ? "Mestre"
                : "Jogador"
              : dono
                ? "Dono"
                : null;
            return (
              <li key={mesa.id}>
                <Link
                  href={`/dnd35/mesas/${mesa.id}`}
                  className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/50 hover:bg-surface-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {mesa.nome}
                    </h2>
                    {rotulo && (
                      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted">
                        {rotulo}
                      </span>
                    )}
                  </div>
                  {mesa.descricao && (
                    <p className="mt-1 flex-1 text-sm text-muted">
                      {mesa.descricao}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-muted">
                    {mesa._count.membros}{" "}
                    {mesa._count.membros === 1 ? "membro" : "membros"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
