// A ficha em leitura — é aqui que a lista de fichas entra.
//
// Editar é um passo deliberado, em /editar, e não o estado padrão de abrir uma
// ficha. Isso protege sobretudo a ficha de outra pessoa: o mestre abre para
// conferir sem risco de esbarrar num campo.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, podeEditarFicha } from "@/lib/permissoes";
import { lerDados, nomeDoJogador } from "@/lib/ficha";
import { FichaLeitura } from "@/app/dnd35/fichas/_components/ficha-leitura";
import { BotaoImprimir } from "@/app/dnd35/fichas/_components/botao-imprimir";
import { CompartilharFicha } from "@/app/dnd35/fichas/_components/compartilhar-ficha";
import {
  HistoricoFicha,
  type EntradaHistorico,
} from "@/app/dnd35/fichas/_components/historico-ficha";
import { excluirFicha } from "@/app/dnd35/fichas/actions";
import type { Mudanca } from "@/lib/ficha-historico";

export const metadata: Metadata = { title: "Ficha · D&D 3.5" };

const dataHora = (d: Date) =>
  d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function FichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await usuarioAtual();
  if (!user) return null;

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      alteracoes: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!ficha) notFound();

  const pode = await podeEditarFicha(user, { userId: ficha.userId }, id);
  if (!pode) notFound();

  const dados = lerDados(ficha.dados);
  dados.jogador ||= nomeDoJogador(ficha.user);
  const ehMinha = ficha.userId === user.id;
  const podeExcluir = user.role === "OWNER" || ehMinha;
  // Compartilhar expõe a ficha fora do app, então é decisão do dono — um
  // mestre pode editar sem poder publicar. Ver `alternarCompartilhamento`.
  const podeCompartilhar = podeExcluir;

  const historico: EntradaHistorico[] = ficha.alteracoes.map((a) => ({
    id: a.id,
    autorId: a.autorId,
    autorNome: a.autorNome,
    createdAt: a.createdAt,
    mudancas: a.mudancas as unknown as Mudanca[],
  }));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:max-w-6xl print:max-w-none print:px-0 print:py-0">
      {/* Nada de navegação e botão no papel. */}
      <div className="print:hidden">
        <Link
          href="/dnd35/fichas"
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Voltar para as fichas
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/dnd35/fichas/${ficha.id}/editar`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Editar
          </Link>
          <Link
            href={`/dnd35/fichas/${ficha.id}/carta`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent"
          >
            Carta
          </Link>
          <BotaoImprimir />
          <Link
            href="/dnd35/fichas/nova"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent"
          >
            Criar outra
          </Link>
        </div>

        <p className="mt-4 text-xs text-muted">
          Criada em {dataHora(ficha.createdAt)}
          {ficha.updatedAt.getTime() !== ficha.createdAt.getTime() &&
            ` · última alteração em ${dataHora(ficha.updatedAt)}`}
          {!ehMinha && ` · personagem de ${ficha.user.name ?? ficha.user.email}`}
        </p>
      </div>

      <div className="mt-8 print:mt-0">
        <FichaLeitura nome={ficha.nome} dados={dados} />
      </div>

      <section className="mt-12 border-t border-border pt-6 print:hidden">
        <h2 className="mb-3 text-sm font-semibold">Histórico de alterações</h2>
        <HistoricoFicha entradas={historico} donoId={ficha.userId} />
      </section>

      {podeCompartilhar && (
        <section className="mt-8 print:hidden">
          <CompartilharFicha fichaId={ficha.id} token={ficha.publicoToken} />
        </section>
      )}

      {podeExcluir && (
        <section className="mt-12 border-t border-border pt-6 print:hidden">
          <form action={excluirFicha}>
            <input type="hidden" name="id" value={ficha.id} />
            <button
              type="submit"
              className="text-sm font-medium text-red-400 transition-colors hover:text-red-300"
            >
              Excluir ficha
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
