"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { adicionarMembro, type EstadoForm } from "@/app/dnd35/mesas/actions";

type UsuarioBusca = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export function AdicionarMembroForm({ mesaId }: { mesaId: string }) {
  const [estado, action, pendente] = useActionState<EstadoForm, FormData>(
    adicionarMembro,
    undefined,
  );
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<UsuarioBusca[]>([]);
  const [selecionado, setSelecionado] = useState<UsuarioBusca | null>(null);
  const [buscando, setBuscando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Busca com debounce enquanto digita (e ainda não escolheu ninguém).
  useEffect(() => {
    if (selecionado) return;
    const q = query.trim();
    if (q.length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/usuarios/buscar?mesaId=${encodeURIComponent(mesaId)}&q=${encodeURIComponent(q)}`,
        );
        setResultados(res.ok ? await res.json() : []);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, selecionado, mesaId]);

  // Limpa tudo após adicionar com sucesso.
  useEffect(() => {
    if (estado?.ok) {
      formRef.current?.reset();
      setQuery("");
      setSelecionado(null);
      setResultados([]);
    }
  }, [estado]);

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <input type="hidden" name="mesaId" value={mesaId} />
      <input type="hidden" name="userId" value={selecionado?.id ?? ""} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <label className="block text-xs font-medium text-muted">Jogador</label>

          {selecionado ? (
            <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-accent/50 bg-background px-3 py-2">
              <span className="truncate text-sm">
                {selecionado.name ?? selecionado.email}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelecionado(null);
                  setQuery("");
                }}
                className="shrink-0 text-xs text-muted hover:text-foreground"
              >
                trocar
              </button>
            </div>
          ) : (
            <>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nome…"
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {query.trim().length >= 2 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface-2 shadow-lg">
                  {buscando && (
                    <li className="px-3 py-2 text-sm text-muted">Buscando…</li>
                  )}
                  {!buscando && resultados.length === 0 && (
                    <li className="px-3 py-2 text-sm text-muted">
                      Nenhum usuário encontrado.
                    </li>
                  )}
                  {resultados.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelecionado(u);
                          setResultados([]);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-surface"
                      >
                        {u.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.image}
                            alt=""
                            className="h-6 w-6 rounded-full border border-border"
                          />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs">
                            🦉
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm">
                            {u.name ?? u.email}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {u.email}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted">Papel</label>
          <select
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
          disabled={pendente || !selecionado}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pendente ? "Adicionando…" : "Adicionar"}
        </button>
      </div>

      {estado?.erro && <p className="mt-3 text-sm text-red-400">{estado.erro}</p>}
      {estado?.ok && (
        <p className="mt-3 text-sm text-green-400">Membro adicionado!</p>
      )}
    </form>
  );
}
