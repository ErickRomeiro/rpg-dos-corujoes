"use client";

import { useActionState } from "react";
import { criarMesa, type EstadoForm } from "@/app/dnd35/mesas/actions";

export function CriarMesaForm() {
  const [estado, action, pendente] = useActionState<EstadoForm, FormData>(
    criarMesa,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium">
          Nome da mesa
        </label>
        <input
          id="nome"
          name="nome"
          required
          maxLength={80}
          placeholder="Ex.: A Maldição de Strahd"
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium">
          Descrição <span className="text-muted">(opcional)</span>
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          maxLength={500}
          placeholder="Um resumo da campanha, dia/horário das sessões, etc."
          className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      {estado?.erro && (
        <p className="text-sm text-red-400">{estado.erro}</p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {pendente ? "Criando…" : "Criar mesa"}
      </button>
    </form>
  );
}
