// A célula de PV do painel: mostra o estado e deixa aplicar dano ou cura ali
// mesmo.
//
// Não é componente de cliente. São dois botões de submit no mesmo formulário,
// distinguidos por `name="acao"` — o navegador manda o valor do botão clicado,
// então não há estado nenhum a manter e a coisa funciona sem JavaScript.

import { ajustarPv } from "@/app/dnd35/mestre/actions";

export function AjustePv({
  fichaId,
  mesaId,
  nome,
  atual,
  maximo,
}: {
  fichaId: string;
  mesaId: string;
  /** Nome do personagem, para os rótulos acessíveis. */
  nome: string;
  atual: number | null;
  /** Já calculado com `pvMax()`, nunca o override cru. */
  maximo: number;
}) {
  const semDados = atual == null && maximo <= 0;
  const efetivo = atual ?? maximo;
  // Entre -1 e -9 o personagem está inconsciente e morrendo; em -10, morto.
  const morrendo = !semDados && efetivo < 0;
  const ferido = !semDados && !morrendo && maximo > 0 && efetivo <= maximo / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      {semDados ? (
        <span className="text-muted">—</span>
      ) : (
        <span
          className={
            morrendo ? "font-semibold text-red-500" : ferido ? "text-red-400" : ""
          }
        >
          {efetivo}
          <span className="text-muted">/{maximo > 0 ? maximo : "?"}</span>
        </span>
      )}

      {morrendo && (
        <span className="text-[10px] uppercase tracking-wide text-red-500">
          {efetivo <= -10 ? "morto" : "morrendo"}
        </span>
      )}

      <form action={ajustarPv} className="flex items-center gap-1">
        <input type="hidden" name="fichaId" value={fichaId} />
        <input type="hidden" name="mesaId" value={mesaId} />
        <input
          type="number"
          name="quantidade"
          min={1}
          defaultValue={1}
          aria-label={`Pontos de vida para ${nome}`}
          className="w-12 rounded border border-border bg-background px-1 py-0.5 text-center text-xs"
        />
        <button
          type="submit"
          name="acao"
          value="dano"
          title={`Aplicar dano em ${nome}`}
          className="rounded border border-border px-1.5 py-0.5 text-xs font-semibold transition-colors hover:border-red-400 hover:text-red-400"
        >
          −
        </button>
        <button
          type="submit"
          name="acao"
          value="cura"
          title={`Curar ${nome}`}
          className="rounded border border-border px-1.5 py-0.5 text-xs font-semibold transition-colors hover:border-emerald-400 hover:text-emerald-400"
        >
          +
        </button>
      </form>
    </div>
  );
}
