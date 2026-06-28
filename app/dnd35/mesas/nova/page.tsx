import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioAtual, ehDono } from "@/lib/permissoes";
import { CriarMesaForm } from "@/app/dnd35/mesas/_components/criar-mesa-form";

export const metadata: Metadata = { title: "Nova mesa · D&D 3.5" };

export default async function NovaMesaPage() {
  const user = await usuarioAtual();
  if (!ehDono(user)) redirect("/dnd35/mesas");

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <Link
        href="/dnd35/mesas"
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para as mesas
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Nova mesa</h1>
      <p className="mt-2 text-muted">
        Crie uma mesa de D&amp;D 3.5. Depois você adiciona os membros e define
        quem é mestre e quem é jogador.
      </p>
      <div className="mt-8">
        <CriarMesaForm />
      </div>
    </div>
  );
}
