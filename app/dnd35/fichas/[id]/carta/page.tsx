// A carta do personagem, em rota própria.
//
// É rota, e não um bloco dentro da leitura, porque o gesto é diferente: a
// leitura é para conferir a ficha inteira, a carta é para mostrar. Tendo
// endereço próprio, ela dá print limpo, dá para mandar no grupo e um dia dá
// para virar imagem exportada sem arrastar o resto da página junto.
//
// A permissão é a mesma da leitura — `podeEditarFicha` —, então a carta não
// abre nenhuma porta nova. O link público continua sendo só o /f/[token].

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, podeEditarFicha } from "@/lib/permissoes";
import { lerDados } from "@/lib/ficha";
import { CartaFicha } from "@/app/dnd35/fichas/_components/carta-ficha";
import { BotaoImprimir } from "@/app/dnd35/fichas/_components/botao-imprimir";

export const metadata: Metadata = { title: "Carta do personagem · D&D 3.5" };

export default async function CartaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await usuarioAtual();
  if (!user) return null;

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    select: { id: true, nome: true, dados: true, userId: true },
  });
  if (!ficha) notFound();

  const pode = await podeEditarFicha(user, { userId: ficha.userId }, id);
  if (!pode) notFound();

  const dados = lerDados(ficha.dados);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/dnd35/fichas/${ficha.id}`}
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          ← Voltar para a ficha
        </Link>
        <BotaoImprimir />
      </div>

      <CartaFicha nome={ficha.nome} dados={dados} />
    </div>
  );
}
