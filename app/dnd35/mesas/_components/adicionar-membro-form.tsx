"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { adicionarMembro, type EstadoForm } from "@/app/dnd35/mesas/actions";

type UsuarioBusca = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};
type FichaItem = { id: string; nome: string };

export function AdicionarMembroForm({ mesaId }: { mesaId: string }) {
  const [estado, action, pendente] = useActionState<EstadoForm, FormData>(
    adicionarMembro,
    undefined,
  );
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<UsuarioBusca[]>([]);
  const [selecionado, setSelecionado] = useState<UsuarioBusca | null>(null);
  const [aberto, setAberto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [papel, setPapel] = useState("JOGADOR");
  const [fichas, setFichas] = useState<FichaItem[]>([]);
  const [fichaId, setFichaId] = useState("");
  const [carregandoFichas, setCarregandoFichas] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Lista usuários: todos os adicionáveis ao focar; filtra ao digitar.
  useEffect(() => {
    if (selecionado || !aberto) return;
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/usuarios/buscar?mesaId=${encodeURIComponent(mesaId)}&q=${encodeURIComponent(query.trim())}`,
        );
        setResultados(res.ok ? await res.json() : []);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, aberto, selecionado, mesaId]);

  // Carrega as fichas do jogador selecionado (quando papel = jogador).
  useEffect(() => {
    if (!selecionado || papel !== "JOGADOR") {
      setFichas([]);
      setFichaId("");
      return;
    }
    setCarregandoFichas(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/usuarios/fichas?mesaId=${encodeURIComponent(mesaId)}&userId=${encodeURIComponent(selecionado.id)}`,
        );
        const lista: FichaItem[] = res.ok ? await res.json() : [];
        setFichas(lista);
        setFichaId(lista.length === 1 ? lista[0].id : "");
      } catch {
        setFichas([]);
        setFichaId("");
      } finally {
        setCarregandoFichas(false);
      }
    })();
  }, [selecionado, papel, mesaId]);

  // Limpa tudo após adicionar com sucesso.
  useEffect(() => {
    if (estado?.ok) {
      formRef.current?.reset();
      setQuery("");
      setSelecionado(null);
      setResultados([]);
      setPapel("JOGADOR");
      setFichas([]);
      setFichaId("");
    }
  }, [estado]);

  const semFicha =
    !!selecionado &&
    papel === "JOGADOR" &&
    !carregandoFichas &&
    fichas.length === 0;
  const podeAdicionar =
    !!selecionado &&
    (papel === "MESTRE" || (papel === "JOGADOR" && fichaId !== ""));

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <input type="hidden" name="mesaId" value={mesaId} />
      <input type="hidden" name="userId" value={selecionado?.id ?? ""} />

      {/* Busca de jogador */}
      <div className="relative">
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
                setAberto(true);
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
              onFocus={() => setAberto(true)}
              onBlur={() => setTimeout(() => setAberto(false), 150)}
              placeholder="Clique para ver todos ou digite o nome…"
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {aberto && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface-2 shadow-lg">
                {buscando && (
                  <li className="px-3 py-2 text-sm text-muted">Buscando…</li>
                )}
                {!buscando && resultados.length === 0 && (
                  <li className="px-3 py-2 text-sm text-muted">
                    Nenhum jogador adicionável.
                  </li>
                )}
                {resultados.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelecionado(u);
                        setResultados([]);
                        setAberto(false);
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

      {/* Papel + ficha */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <label className="block text-xs font-medium text-muted">Papel</label>
          <select
            value={papel}
            onChange={(e) => setPapel(e.target.value)}
            className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="JOGADOR">Jogador</option>
            <option value="MESTRE">Mestre</option>
          </select>
        </div>

        {papel === "JOGADOR" && (
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted">
              Ficha do personagem
            </label>
            <select
              name="fichaId"
              value={fichaId}
              onChange={(e) => setFichaId(e.target.value)}
              disabled={!selecionado || carregandoFichas || fichas.length === 0}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-60"
            >
              <option value="">
                {!selecionado
                  ? "Selecione um jogador primeiro"
                  : carregandoFichas
                    ? "Carregando…"
                    : fichas.length === 0
                      ? "Sem ficha disponível"
                      : "Escolha a ficha…"}
              </option>
              {fichas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={pendente || !podeAdicionar}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pendente ? "Adicionando…" : "Adicionar"}
        </button>
      </div>

      {semFicha && (
        <Link
          href="/dnd35/fichas"
          className="block rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-300 transition-colors hover:bg-amber-400/20"
        >
          Esse jogador ainda não tem ficha de D&amp;D 3.5. Clique aqui para criar
          uma ficha → <span className="text-muted">(ou adicione como mestre)</span>
        </Link>
      )}
      {estado?.erro && <p className="text-sm text-red-400">{estado.erro}</p>}
      {estado?.ok && <p className="text-sm text-green-400">Membro adicionado!</p>}
    </form>
  );
}
