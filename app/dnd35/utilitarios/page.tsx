import type { Metadata } from "next";
import { Rolador } from "@/app/dnd35/utilitarios/_components/rolador";

export const metadata: Metadata = {
  title: "Utilitários · D&D 3.5",
  description: "Rolador de dados para a mesa de D&D 3.5.",
};

export default function UtilitariosPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">🎲 Utilitários</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Rolador de dados com modificadores e histórico da sessão. Geradores de
          NPCs, nomes e tesouros entram aqui depois.
        </p>
      </header>

      <Rolador />
    </div>
  );
}
