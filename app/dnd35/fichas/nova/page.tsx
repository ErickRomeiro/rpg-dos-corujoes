import type { Metadata } from "next";
import Link from "next/link";
import { usuarioAtual } from "@/lib/permissoes";
import { CriarFichaForm } from "@/app/dnd35/fichas/_components/criar-ficha-form";

export const metadata: Metadata = { title: "Nova ficha · D&D 3.5" };

export default async function NovaFichaPage() {
  const user = await usuarioAtual();
  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <Link
        href="/dnd35/fichas"
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para as fichas
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Novo personagem</h1>
      <p className="mt-2 text-muted">
        Dê um nome ao personagem. Em seguida você preenche os detalhes da ficha.
      </p>
      <div className="mt-8">
        <CriarFichaForm />
      </div>
    </div>
  );
}
