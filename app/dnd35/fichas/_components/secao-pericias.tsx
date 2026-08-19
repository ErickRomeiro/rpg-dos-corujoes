"use client";

// Tabela de perícias, no formato da ficha oficial: graduações + modificador do
// atributo + diversos, com a penalidade de armadura aplicada onde a regra manda.
// O total nunca é digitado — sai sempre da conta, com os atributos atuais.

import {
  ABREV_ATRIBUTO,
  PERICIAS,
  formatarMod,
  modAtributo,
  penalidadeArmadura,
  penalidadeArmaduraAuto,
  periciaVazia,
  totalPericia,
  type DadosFicha,
  type PericiaFicha,
} from "@/lib/ficha";

const numCls =
  "w-full rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm outline-none focus:border-accent";

export function SecaoPericias({
  dados,
  aoMudar,
  periciasClasse,
}: {
  dados: DadosFicha;
  aoMudar: <K extends keyof DadosFicha>(campo: K, valor: DadosFicha[K]) => void;
  /** Ids das perícias que são de classe, derivadas das classes escolhidas. */
  periciasClasse: Set<string>;
}) {
  const penalAuto = penalidadeArmaduraAuto(dados);
  const penalEfetiva = penalidadeArmadura(dados);
  const sobrescrita = dados.penalidadeArmadura != null;

  function atualizar(id: string, campo: keyof PericiaFicha, valor: string | boolean) {
    const atual = dados.pericias[id] ?? periciaVazia();
    const novo: PericiaFicha =
      campo === "classe"
        ? { ...atual, classe: valor === true }
        : { ...atual, [campo]: valor === "" ? null : Number(valor) };
    aoMudar("pericias", { ...dados.pericias, [id]: novo });
  }

  const totalGraduacoes = PERICIAS.reduce(
    (s, p) => s + (dados.pericias[p.id]?.ranks ?? 0),
    0,
  );

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Perícias
        </h2>
        <span className="flex items-baseline gap-3 text-xs text-muted">
          {periciasClasse.size > 0 && (
            <button
              type="button"
              onClick={() => {
                const novo = { ...dados.pericias };
                for (const id of periciasClasse) {
                  novo[id] = { ...(novo[id] ?? periciaVazia()), classe: true };
                }
                aoMudar("pericias", novo);
              }}
              className="font-medium text-accent transition-colors hover:text-accent-strong"
            >
              marcar as {periciasClasse.size} de classe
            </button>
          )}
          <span>
            {totalGraduacoes} graduaç{totalGraduacoes === 1 ? "ão" : "ões"} no total
          </span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <label className="block text-xs font-medium text-muted">
              Penalidade de armadura
            </label>
            {sobrescrita && (
              <button
                type="button"
                onClick={() => aoMudar("penalidadeArmadura", null)}
                className="text-[11px] font-medium text-accent hover:text-accent-strong"
              >
                automático
              </button>
            )}
          </div>
          <input
            type="number"
            value={dados.penalidadeArmadura ?? ""}
            onChange={(e) =>
              aoMudar(
                "penalidadeArmadura",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            placeholder={String(penalAuto)}
            className={`mt-1 w-28 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-accent ${
              sobrescrita ? "border-accent/60" : "border-border placeholder:text-accent"
            }`}
          />
        </div>
        <p className="text-xs text-muted">
          {sobrescrita
            ? `Manual. Somando as armaduras daria ${penalAuto}.`
            : "Somada das armaduras equipadas."}{" "}
          Aplicada às perícias marcadas com{" "}
          <span className="text-foreground">🛡</span> (em dobro na Natação).
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="pb-2 text-left font-medium">Perícia</th>
              <th className="pb-2 text-center font-medium">Atrib.</th>
              <th className="pb-2 text-center font-medium" title="Perícia de classe">
                Classe
              </th>
              <th className="w-20 pb-2 text-center font-medium">Grad.</th>
              <th className="w-14 pb-2 text-center font-medium">Mod.</th>
              <th className="w-20 pb-2 text-center font-medium">Divers.</th>
              <th className="w-16 pb-2 text-center font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {PERICIAS.map((pericia) => {
              const entrada = dados.pericias[pericia.id];
              const ranks = entrada?.ranks ?? 0;
              const usavel = pericia.semTreino || ranks > 0;
              const mod = modAtributo(dados, pericia.atributo);
              const total = totalPericia(pericia, entrada, dados);

              return (
                <tr
                  key={pericia.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-1.5 pr-2">
                    <span className={usavel ? "" : "text-muted"}>
                      {pericia.nome}
                    </span>
                    {pericia.armadura && (
                      <span
                        className="ml-1.5 text-xs"
                        title={
                          pericia.dobraArmadura
                            ? "Sofre penalidade de armadura em dobro"
                            : "Sofre penalidade de armadura"
                        }
                      >
                        🛡
                      </span>
                    )}
                    {!pericia.semTreino && (
                      <span
                        className="ml-1.5 text-xs text-muted"
                        title="Só pode ser usada com treinamento (1+ graduação)"
                      >
                        ✦
                      </span>
                    )}
                    {periciasClasse.has(pericia.id) && (
                      <span
                        className="ml-1.5 text-xs text-accent"
                        title="É perícia de classe para as classes escolhidas"
                      >
                        ★
                      </span>
                    )}
                  </td>
                  <td className="px-2 text-center text-xs text-muted">
                    {ABREV_ATRIBUTO[pericia.atributo]}
                  </td>
                  <td className="px-2 text-center">
                    <input
                      type="checkbox"
                      checked={entrada?.classe ?? false}
                      onChange={(e) =>
                        atualizar(pericia.id, "classe", e.target.checked)
                      }
                      aria-label={`${pericia.nome} é perícia de classe`}
                      className="h-4 w-4 accent-accent"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={entrada?.ranks ?? ""}
                      onChange={(e) =>
                        atualizar(pericia.id, "ranks", e.target.value)
                      }
                      aria-label={`Graduações em ${pericia.nome}`}
                      className={numCls}
                    />
                  </td>
                  <td className="px-2 text-center text-xs text-muted">
                    {formatarMod(mod)}
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      value={entrada?.misc ?? ""}
                      onChange={(e) =>
                        atualizar(pericia.id, "misc", e.target.value)
                      }
                      aria-label={`Bônus diversos em ${pericia.nome}`}
                      className={numCls}
                    />
                  </td>
                  <td className="px-2 text-center font-semibold">
                    {usavel ? (
                      <span className="text-accent">{formatarMod(total)}</span>
                    ) : (
                      <span
                        className="text-muted"
                        title="Precisa de treinamento para usar"
                      >
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted">
        ✦ exige treinamento · 🛡 sofre penalidade de armadura ({penalEfetiva})
        {periciasClasse.size > 0 && " · ★ é perícia de classe"}
      </p>
    </section>
  );
}
