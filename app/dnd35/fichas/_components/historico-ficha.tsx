// A linha do tempo de alterações da ficha.
//
// Cada entrada é uma edição salva, com o que mudou campo a campo. O histórico
// começa a existir a partir da primeira edição depois de a feature entrar:
// ficha antiga não tem passado gravado, e inventar um seria mentir sobre quem
// mudou o quê.

import type { Mudanca } from "@/lib/ficha-historico";

export type EntradaHistorico = {
  id: string;
  autorId: string | null;
  autorNome: string;
  createdAt: Date;
  mudancas: Mudanca[];
};

const dataHora = (d: Date) =>
  d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** "12 → 18", "+ Ataque Poderoso", "− Adaga". */
function Valor({ de, para }: { de: string; para: string }) {
  if (de === "")
    return (
      <span>
        <span className="text-emerald-500">+</span> {para}
      </span>
    );
  if (para === "")
    return (
      <span className="text-muted">
        <span className="text-red-400">−</span> <s>{de}</s>
      </span>
    );
  return (
    <span>
      <span className="text-muted line-through">{de}</span>
      <span className="mx-1 text-muted">→</span>
      <span className="font-medium">{para}</span>
    </span>
  );
}

export function HistoricoFicha({
  entradas,
  donoId,
}: {
  entradas: EntradaHistorico[];
  /** Dono da ficha, para distinguir edição do mestre da do próprio jogador. */
  donoId: string;
}) {
  if (entradas.length === 0)
    return (
      <p className="text-sm text-muted">
        Nenhuma alteração registrada ainda. O histórico passa a ser gravado a
        cada salvamento.
      </p>
    );

  return (
    <ol className="space-y-4">
      {entradas.map((e) => (
        <li key={e.id} className="border-l-2 border-border pl-4">
          <p className="text-sm">
            <span className="font-medium">{e.autorNome}</span>
            {e.autorId !== donoId && (
              <span className="ml-1 rounded bg-accent/15 px-1.5 py-0.5 text-[11px] text-accent">
                mestre
              </span>
            )}
            <span className="ml-2 text-xs text-muted">
              {dataHora(e.createdAt)}
            </span>
          </p>
          <ul className="mt-1 space-y-0.5">
            {e.mudancas.map((m, i) => (
              <li key={i} className="grid grid-cols-[minmax(0,14rem)_1fr] gap-2 text-sm">
                <span className="truncate text-muted" title={m.campo}>
                  {m.campo}
                </span>
                <Valor de={m.de} para={m.para} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
