"use client";

// Editor de lista reaproveitado pelas seções repetíveis da ficha
// (armas, armaduras, talentos, habilidades, equipamento, magias).

import { inputCls } from "@/app/dnd35/fichas/_components/campos";

export type Campo<T> = {
  chave: keyof T & string;
  rotulo: string;
  tipo?: "texto" | "numero" | "select";
  placeholder?: string;
  opcoes?: readonly string[];
  /** Classes de grid-column. Padrão: 2 de 6. */
  span?: string;
};

export function ListaEditavel<T extends Record<string, unknown>>({
  titulo,
  descricao,
  itens,
  aoMudar,
  campos,
  itemVazio,
  rotuloAdicionar,
  vazio,
  rodape,
}: {
  titulo: string;
  descricao?: string;
  itens: T[];
  aoMudar: (itens: T[]) => void;
  campos: Campo<T>[];
  itemVazio: () => T;
  rotuloAdicionar: string;
  vazio: string;
  rodape?: React.ReactNode;
}) {
  function atualizar(indice: number, chave: keyof T & string, valor: unknown) {
    aoMudar(
      itens.map((item, i) => (i === indice ? { ...item, [chave]: valor } : item)),
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {titulo}
        </h2>
        {itens.length > 0 && (
          <span className="text-xs text-muted">
            {itens.length} {itens.length === 1 ? "item" : "itens"}
          </span>
        )}
      </div>
      {descricao && <p className="mt-1 text-xs text-muted">{descricao}</p>}

      {itens.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{vazio}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {itens.map((item, indice) => (
            <li
              key={indice}
              className="rounded-lg border border-border bg-background/40 p-4"
            >
              <div className="grid gap-3 sm:grid-cols-6">
                {campos.map((campo) => {
                  const valor = item[campo.chave];
                  return (
                    <div
                      key={campo.chave}
                      className={campo.span ?? "sm:col-span-2"}
                    >
                      <label className="block text-xs font-medium text-muted">
                        {campo.rotulo}
                      </label>

                      {campo.tipo === "select" ? (
                        <select
                          value={String(valor ?? "")}
                          onChange={(e) =>
                            atualizar(indice, campo.chave, e.target.value)
                          }
                          className={inputCls}
                        >
                          <option value="">—</option>
                          {campo.opcoes?.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : campo.tipo === "numero" ? (
                        <input
                          type="number"
                          inputMode="numeric"
                          value={valor == null ? "" : String(valor)}
                          onChange={(e) =>
                            atualizar(
                              indice,
                              campo.chave,
                              e.target.value === "" ? null : Number(e.target.value),
                            )
                          }
                          placeholder={campo.placeholder}
                          className={inputCls}
                        />
                      ) : (
                        <input
                          value={String(valor ?? "")}
                          onChange={(e) =>
                            atualizar(indice, campo.chave, e.target.value)
                          }
                          placeholder={campo.placeholder}
                          className={inputCls}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => aoMudar(itens.filter((_, i) => i !== indice))}
                  className="text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => aoMudar([...itens, itemVazio()])}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
        >
          + {rotuloAdicionar}
        </button>
        {rodape}
      </div>
    </section>
  );
}
