// Edição da ficha. A leitura mora um nível acima, em /dnd35/fichas/[id].
//
// Separar as duas rotas é o que permite que abrir uma ficha da lista não seja
// um convite a mexer nela: entra-se pela leitura, e a edição é um passo
// deliberado. Quem não pode editar nunca chega aqui.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, podeEditarFicha } from "@/lib/permissoes";
import { lerDados, nomeDoJogador } from "@/lib/ficha";
import { catalogoDaFicha } from "@/lib/catalogo";
import { FichaForm } from "@/app/dnd35/fichas/_components/ficha-form";
import { RetratoFicha } from "@/app/dnd35/fichas/_components/retrato-ficha";

export const metadata: Metadata = { title: "Editar ficha · D&D 3.5" };

export default async function EditarFichaPage({
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
      // A mesa em que a ficha é usada define qual homebrew fica visível.
      membros: { select: { mesaId: true }, take: 1 },
    },
  });
  if (!ficha) notFound();

  const pode = await podeEditarFicha(user, { userId: ficha.userId }, id);
  if (!pode) notFound();

  const dados = lerDados(ficha.dados);
  // Ficha criada antes de "Jogador" nascer preenchido continua sem ele. Vale o
  // dono da ficha, não quem está olhando: mestre abrindo a ficha de um jogador
  // tem de ver o nome do jogador. Grava de verdade no próximo salvamento.
  dados.jogador ||= nomeDoJogador(ficha.user);
  const catalogo = await catalogoDaFicha(ficha.membros[0]?.mesaId ?? null);
  const ehMinha = ficha.userId === user.id;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href={`/dnd35/fichas/${ficha.id}`}
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para a ficha
      </Link>

      <header className="mb-8 mt-6">
        <h1 className="text-3xl font-bold tracking-tight">{ficha.nome}</h1>
        <p className="mt-1 text-sm text-muted">
          {ehMinha
            ? "Editando"
            : `Editando o personagem de ${ficha.user.name ?? ficha.user.email}`}
        </p>
      </header>

      {/* Antes do formulário: o retrato tem envio próprio e imediato, e não
          entra no "Salvar ficha" — ver o comentário em retrato-ficha.tsx. */}
      <section className="mb-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Retrato
        </h2>
        <RetratoFicha
          fichaId={ficha.id}
          retrato={dados.retrato}
          nome={ficha.nome}
        />
      </section>

      <FichaForm
        id={ficha.id}
        nome={ficha.nome}
        dados={dados}
        catalogo={catalogo}
      />
    </div>
  );
}
