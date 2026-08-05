import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, podeEditarFicha } from "@/lib/permissoes";
import { lerDados } from "@/lib/ficha";
import { catalogoDaFicha } from "@/lib/catalogo";
import { FichaForm } from "@/app/dnd35/fichas/_components/ficha-form";
import { excluirFicha } from "@/app/dnd35/fichas/actions";

export const metadata: Metadata = { title: "Ficha · D&D 3.5" };

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
      // A mesa em que a ficha é usada define qual homebrew fica visível.
      membros: { select: { mesaId: true }, take: 1 },
    },
  });
  if (!ficha) notFound();

  const pode = await podeEditarFicha(user, { userId: ficha.userId }, id);
  if (!pode) notFound();

  const dados = lerDados(ficha.dados);
  const catalogo = await catalogoDaFicha(ficha.membros[0]?.mesaId ?? null);
  const ehMinha = ficha.userId === user.id;
  const podeExcluir = user.role === "OWNER" || ehMinha;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/dnd35/fichas"
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para as fichas
      </Link>

      <header className="mb-8 mt-6">
        <h1 className="text-3xl font-bold tracking-tight">{ficha.nome}</h1>
        {!ehMinha && (
          <p className="mt-1 text-sm text-muted">
            Personagem de {ficha.user.name ?? ficha.user.email}
          </p>
        )}
      </header>

      <FichaForm
        id={ficha.id}
        nome={ficha.nome}
        dados={dados}
        catalogo={catalogo}
      />

      {podeExcluir && (
        <section className="mt-12 border-t border-border pt-6">
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
