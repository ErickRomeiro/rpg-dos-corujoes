import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, podeGerenciarMesa } from "@/lib/permissoes";
import {
  PERICIAS,
  ca,
  fortitude,
  formatarMod,
  iniciativa,
  lerDados,
  reflexos,
  totalPericia,
  vontade,
  type DadosFicha,
} from "@/lib/ficha";

export const metadata: Metadata = { title: "Painel do mestre · D&D 3.5" };

/**
 * Perícias que o mestre rola em segredo pelos jogadores — é o que justifica
 * ter os totais do grupo numa tela só.
 */
const PERICIAS_PASSIVAS = ["observar", "ouvir", "procurar", "sentirMotivacao"];

function pericia(id: string) {
  const p = PERICIAS.find((x) => x.id === id);
  if (!p) throw new Error(`Perícia desconhecida: ${id}`);
  return p;
}

function totalPassiva(dados: DadosFicha, id: string): number {
  return totalPericia(pericia(id), dados.pericias[id], dados);
}

export default async function PainelMestrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await usuarioAtual();
  if (!user) return null;

  // Só mestre da mesa (ou dono do site) enxerga as fichas do grupo.
  if (!(await podeGerenciarMesa(user, id))) notFound();

  const mesa = await prisma.mesa.findUnique({
    where: { id },
    include: {
      membros: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          ficha: { select: { id: true, nome: true, dados: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!mesa) notFound();

  const mestres = mesa.membros.filter((m) => m.papel === "MESTRE");
  const jogadores = mesa.membros.filter((m) => m.papel === "JOGADOR");

  const comFicha = jogadores
    .filter((m) => m.ficha)
    .map((m) => ({
      membro: m,
      ficha: m.ficha!,
      dados: lerDados(m.ficha!.dados),
    }));
  const semFicha = jogadores.filter((m) => !m.ficha);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/dnd35/mestre"
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para as mesas que mestro
      </Link>

      <header className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{mesa.nome}</h1>
          <p className="mt-1 text-sm text-muted">
            {jogadores.length} {jogadores.length === 1 ? "jogador" : "jogadores"}
            {mestres.length > 0 && (
              <>
                {" · "}
                mestre{mestres.length === 1 ? "" : "s"}:{" "}
                {mestres.map((m) => m.user.name ?? m.user.email).join(", ")}
              </>
            )}
          </p>
        </div>
        <Link
          href={`/dnd35/mesas/${mesa.id}`}
          className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
        >
          Gerenciar membros
        </Link>
      </header>

      {comFicha.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
          Nenhum jogador desta mesa tem ficha vinculada ainda.
        </div>
      ) : (
        <>
          {/* Panorama de combate */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Panorama de combate
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="pb-2 text-left font-medium">Personagem</th>
                    <th className="pb-2 text-left font-medium">Jogador</th>
                    <th className="pb-2 text-center font-medium">PV</th>
                    <th className="pb-2 text-center font-medium">CA</th>
                    <th className="pb-2 text-center font-medium">Inic.</th>
                    <th className="pb-2 text-center font-medium">Fort</th>
                    <th className="pb-2 text-center font-medium">Ref</th>
                    <th className="pb-2 text-center font-medium">Von</th>
                  </tr>
                </thead>
                <tbody>
                  {comFicha.map(({ membro, ficha, dados }) => {
                    const pvAtual = dados.pvAtual;
                    const pvMax = dados.pvMax;
                    // Destaque quando o personagem está abaixo de metade dos PV.
                    const ferido =
                      pvAtual != null && pvMax != null && pvMax > 0
                        ? pvAtual <= pvMax / 2
                        : false;

                    return (
                      <tr
                        key={membro.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2 pr-3">
                          <Link
                            href={`/dnd35/fichas/${ficha.id}`}
                            className="font-medium transition-colors hover:text-accent"
                          >
                            {ficha.nome}
                          </Link>
                          {dados.classeNivel && (
                            <span className="block text-xs text-muted">
                              {[dados.raca, dados.classeNivel]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-muted">
                          {membro.user.name ?? membro.user.email}
                        </td>
                        <td className="px-2 text-center">
                          {pvAtual == null && pvMax == null ? (
                            <span className="text-muted">—</span>
                          ) : (
                            <span className={ferido ? "text-red-400" : ""}>
                              {pvAtual ?? "?"}
                              <span className="text-muted">/{pvMax ?? "?"}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-2 text-center">{ca(dados)}</td>
                        <td className="px-2 text-center">
                          {formatarMod(iniciativa(dados))}
                        </td>
                        {[
                          fortitude(dados),
                          reflexos(dados),
                          vontade(dados),
                        ].map((valor, i) => (
                          <td key={i} className="px-2 text-center">
                            {formatarMod(valor)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">
              PV em vermelho = personagem na metade ou menos dos pontos de vida.
            </p>
          </section>

          {/* Perícias que o mestre rola escondido */}
          <section className="mt-8 rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Rolagens secretas
            </h2>
            <p className="mt-1 text-xs text-muted">
              Totais já com atributo, graduações, bônus diversos e penalidade de
              armadura.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="pb-2 text-left font-medium">Personagem</th>
                    {PERICIAS_PASSIVAS.map((pid) => (
                      <th key={pid} className="pb-2 text-center font-medium">
                        {pericia(pid).nome}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comFicha.map(({ membro, ficha, dados }) => (
                    <tr
                      key={membro.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2 pr-3 font-medium">{ficha.nome}</td>
                      {PERICIAS_PASSIVAS.map((pid) => {
                        const p = pericia(pid);
                        const ranks = dados.pericias[pid]?.ranks ?? 0;
                        const usavel = p.semTreino || ranks > 0;
                        return (
                          <td key={pid} className="px-2 text-center">
                            {usavel ? (
                              <span className="text-accent">
                                {formatarMod(totalPassiva(dados, pid))}
                              </span>
                            ) : (
                              <span
                                className="text-muted"
                                title="Sem treinamento nesta perícia"
                              >
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {semFicha.length > 0 && (
        <section className="mt-8 rounded-xl border border-amber-400/40 bg-amber-400/10 p-5">
          <h2 className="text-sm font-semibold text-amber-300">
            Jogadores sem ficha vinculada
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-amber-200/90">
            {semFicha.map((m) => (
              <li key={m.id}>{m.user.name ?? m.user.email}</li>
            ))}
          </ul>
          <Link
            href={`/dnd35/mesas/${mesa.id}`}
            className="mt-3 inline-block text-sm font-medium text-amber-300 underline underline-offset-4 hover:text-amber-200"
          >
            Vincular fichas na tela da mesa →
          </Link>
        </section>
      )}
    </div>
  );
}
