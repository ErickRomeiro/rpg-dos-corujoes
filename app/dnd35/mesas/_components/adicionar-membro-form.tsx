"use client";

import { useActionState, useEffect, useRef } from "react";
import { adicionarMembro, type EstadoForm } from "@/app/dnd35/mesas/actions";

export function AdicionarMembroForm({ mesaId }: { mesaId: string }) {
  const [estado, action, pendente] = useActionState<EstadoForm, FormData>(
    adicionarMembro,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Limpa o formulário após adicionar com sucesso.
  useEffect(() => {
    if (estado?.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="mesaId" value={mesaId} />

      <div className="flex-1">
        <label htmlFor="email" className="block text-xs font-medium text-muted">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="pessoa@gmail.com"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="papel" className="block text-xs font-medium text-muted">
          Papel
        </label>
        <select
          id="papel"
          name="papel"
          defaultValue="JOGADOR"
          className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="JOGADOR">Jogador</option>
          <option value="MESTRE">Mestre</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pendente}
        className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {pendente ? "Adicionando…" : "Adicionar"}
      </button>

      {estado?.erro && (
        <p className="w-full text-sm text-red-400 sm:order-last">
          {estado.erro}
        </p>
      )}
      {estado?.ok && (
        <p className="w-full text-sm text-green-400 sm:order-last">
          Membro adicionado!
        </p>
      )}
    </form>
  );
}
