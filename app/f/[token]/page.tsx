// A ficha vista por quem recebeu o link — sem login, só leitura.
//
// Mora fora de /dnd35 e com caminho curto porque é um endereço para colar no
// grupo: /f/<token>. O token é a credencial inteira, então quem o tem entra, e
// quem não o tem não descobre a ficha por outro caminho — não há listagem nem
// busca por aqui, e o id real da ficha nunca aparece.
//
// O que esta página deliberadamente NÃO tem: editar, excluir, o painel de
// compartilhamento e o histórico de alterações. O dono compartilhou o
// personagem, não quem andou mexendo nele nem quando.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lerDados } from "@/lib/ficha";
import { FichaLeitura } from "@/app/dnd35/fichas/_components/ficha-leitura";
import { BotaoImprimir } from "@/app/dnd35/fichas/_components/botao-imprimir";

// Revogar tem de valer na hora. No cache padrão ('auto') esta rota entraria no
// cache de rota cheia e um link já revogado continuaria servindo a ficha —
// o que esvaziaria o sentido do botão "Revogar link".
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ficha compartilhada",
  // Link secreto não pode cair em buscador: indexar transformaria "quem tem o
  // endereço vê" em "qualquer um acha".
  robots: { index: false, follow: false },
};

const dataHora = (d: Date) =>
  d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function FichaPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const ficha = await prisma.ficha.findUnique({
    where: { publicoToken: token },
    select: {
      nome: true,
      dados: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true } },
    },
  });
  // Token errado e token revogado dão exatamente a mesma resposta: 404. Dizer
  // "este link foi revogado" já confirmaria que a ficha existe.
  if (!ficha) notFound();

  const dados = lerDados(ficha.dados);
  // Só o nome — nunca o e-mail. `nomeDoJogador` cai no e-mail quando não há
  // nome, e aqui isso publicaria o endereço do dono para quem receber o link.
  dados.jogador ||= ficha.user.name ?? "";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:max-w-6xl print:max-w-none print:px-0 print:py-0">
      <div className="print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Ficha compartilhada · somente leitura
          </p>
          <BotaoImprimir />
        </div>
        <p className="mt-2 text-xs text-muted">
          Criada em {dataHora(ficha.createdAt)}
          {ficha.updatedAt.getTime() !== ficha.createdAt.getTime() &&
            ` · última alteração em ${dataHora(ficha.updatedAt)}`}
        </p>
      </div>

      <div className="mt-8 print:mt-0">
        <FichaLeitura nome={ficha.nome} dados={dados} />
      </div>

      <p className="mt-12 border-t border-border pt-6 text-xs text-muted print:hidden">
        Esta é uma cópia de leitura publicada pelo jogador. Ela acompanha as
        alterações da ficha, e pode deixar de existir quando o link for
        revogado.{" "}
        <Link href="/" className="font-medium hover:text-foreground">
          RPG dos Corujões
        </Link>
      </p>
    </div>
  );
}
