import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, ehDono, podeGerenciarMesa } from "@/lib/permissoes";
import {
  alterarPapel,
  removerMembro,
  excluirMesa,
} from "@/app/dnd35/mesas/actions";
import { AdicionarMembroForm } from "@/app/dnd35/mesas/_components/adicionar-membro-form";

export const metadata: Metadata = { title: "Mesa · D&D 3.5" };

export default async function MesaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await usuarioAtual();
  if (!user) return null;

  const mesa = await prisma.mesa.findUnique({
    where: { id },
    include: {
      criadoPor: { select: { name: true, email: true } },
      membros: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          ficha: { select: { id: true, nome: true } },
        },
        orderBy: [{ papel: "asc" }, { user: { name: "asc" } }],
      },
    },
  });

  if (!mesa) notFound();

  const dono = ehDono(user);
  const souMembro = mesa.membros.some((m) => m.user.id === user.id);
  // Só dono ou membros podem ver a mesa.
  if (!dono && !souMembro) notFound();

  const podeGerenciar = await podeGerenciarMesa(user, mesa.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/dnd35/mesas"
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para as mesas
      </Link>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{mesa.nome}</h1>
          {mesa.descricao && (
            <p className="mt-2 whitespace-pre-line text-muted">
              {mesa.descricao}
            </p>
          )}
        </div>
        {podeGerenciar && (
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/dnd35/mestre/${mesa.id}`}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Painel do mestre
            </Link>
            <Link
              href={`/dnd35/mesas/${mesa.id}/catalogo`}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
            >
              Conteúdo da mesa
            </Link>
          </div>
        )}
      </header>

      {/* Membros */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Membros
          <span className="ml-2 text-sm font-normal text-muted">
            ({mesa.membros.length})
          </span>
        </h2>

        {mesa.membros.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Nenhum membro ainda{podeGerenciar ? " — adicione abaixo." : "."}
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {mesa.membros.map((m) => {
              const ehMestre = m.papel === "MESTRE";
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-3 p-4"
                >
                  {m.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.user.image}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full border border-border"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-sm">
                      🦉
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {m.user.name ?? m.user.email}
                      {m.user.id === user.id && (
                        <span className="ml-1 text-xs text-muted">(você)</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {m.user.email}
                    </p>
                    {m.ficha && (
                      <Link
                        href={`/dnd35/fichas/${m.ficha.id}`}
                        className="block truncate text-xs text-accent hover:underline"
                      >
                        🎭 {m.ficha.nome}
                      </Link>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      ehMestre
                        ? "bg-accent/15 text-accent"
                        : "border border-border text-muted"
                    }`}
                  >
                    {ehMestre ? "Mestre" : "Jogador"}
                  </span>

                  {podeGerenciar && (
                    <div className="flex shrink-0 items-center gap-1">
                      <form action={alterarPapel}>
                        <input type="hidden" name="membroId" value={m.id} />
                        <input
                          type="hidden"
                          name="papel"
                          value={ehMestre ? "JOGADOR" : "MESTRE"}
                        />
                        <button
                          type="submit"
                          className="rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                          title={
                            ehMestre
                              ? "Tornar jogador"
                              : "Tornar mestre"
                          }
                        >
                          {ehMestre ? "↓ Jogador" : "↑ Mestre"}
                        </button>
                      </form>
                      <form action={removerMembro}>
                        <input type="hidden" name="membroId" value={m.id} />
                        <button
                          type="submit"
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-400/10"
                          title="Remover da mesa"
                        >
                          Remover
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Adicionar membro (dono ou mestre da mesa) */}
      {podeGerenciar && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">
            Adicionar membro
          </h2>
          <p className="mt-1 text-sm text-muted">
            Informe o e-mail de alguém que já entrou no site e escolha o papel.
          </p>
          <div className="mt-4">
            <AdicionarMembroForm mesaId={mesa.id} />
          </div>
        </section>
      )}

      {/* Excluir mesa (apenas dono) */}
      {dono && (
        <section className="mt-12 border-t border-border pt-6">
          <form action={excluirMesa}>
            <input type="hidden" name="mesaId" value={mesa.id} />
            <button
              type="submit"
              className="text-sm font-medium text-red-400 transition-colors hover:text-red-300"
            >
              Excluir mesa
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
