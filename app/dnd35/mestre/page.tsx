import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, ehDono } from "@/lib/permissoes";

export const metadata: Metadata = {
  title: "Mestre · D&D 3.5",
  description: "Painel de narração: visão consolidada das fichas das suas mesas.",
};

const SISTEMA = "dnd35";

export default async function MestrePage() {
  const user = await usuarioAtual();
  if (!user) return null; // o proxy já garante login

  const dono = ehDono(user);

  // O dono do site enxerga todas as mesas; os demais, só as que mestram.
  const mesas = await prisma.mesa.findMany({
    where: dono
      ? { sistema: SISTEMA }
      : {
          sistema: SISTEMA,
          membros: { some: { userId: user.id, papel: "MESTRE" } },
        },
    include: { _count: { select: { membros: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          🐉 Ferramentas de Mestre
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Escolha uma mesa para ver as fichas do grupo lado a lado — PV, CA,
          resistências e as perícias que você costuma rolar em segredo.
        </p>
      </header>

      {mesas.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-muted">
            Você ainda não mestra nenhuma mesa de D&amp;D 3.5.
          </p>
          <Link
            href="/dnd35/mesas"
            className="mt-4 inline-block text-sm font-medium text-accent transition-colors hover:text-accent-strong"
          >
            Ver minhas mesas →
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {mesas.map((mesa) => (
            <li key={mesa.id}>
              <Link
                href={`/dnd35/mestre/${mesa.id}`}
                className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/50 hover:bg-surface-2"
              >
                <h2 className="text-lg font-semibold tracking-tight">
                  {mesa.nome}
                </h2>
                {mesa.descricao && (
                  <p className="mt-1 flex-1 text-sm text-muted">
                    {mesa.descricao}
                  </p>
                )}
                <p className="mt-4 text-xs text-muted">
                  {mesa._count.membros}{" "}
                  {mesa._count.membros === 1 ? "membro" : "membros"} · abrir
                  painel →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
