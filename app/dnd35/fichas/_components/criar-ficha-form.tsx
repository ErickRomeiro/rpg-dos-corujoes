"use client";

import { useActionState } from "react";
import { criarFicha, type EstadoFicha } from "@/app/dnd35/fichas/actions";

export function CriarFichaForm() {
  const [estado, action, pendente] = useActionState<EstadoFicha, FormData>(
    criarFicha,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium">
          Nome do personagem
        </label>
        <input
          id="nome"
          name="nome"
          required
          maxLength={80}
          placeholder="Ex.: Aelar, o Andarilho"
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {estado?.erro && <p className="text-sm text-red-400">{estado.erro}</p>}

      <button
        type="submit"
        disabled={pendente}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {pendente ? "Criando…" : "Criar e preencher"}
      </button>
    </form>
  );
}
