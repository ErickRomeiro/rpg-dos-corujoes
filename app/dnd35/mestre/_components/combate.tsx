// O rastreador de iniciativa dentro do painel do mestre.
//
// Sem componente de cliente, como o AjustePv ao lado: são formulários que
// chamam server actions, então a fila continua funcionando com o JavaScript
// ainda carregando — o que importa numa tela usada no meio de uma luta.

import {
  adicionarAvulso,
  ajustarPvAvulso,
  avancarTurno,
  definirIniciativa,
  encerrarCombate,
  iniciarCombate,
  removerParticipante,
  voltarTurno,
} from "@/app/dnd35/mestre/combate-actions";
import { AjustePv } from "@/app/dnd35/mestre/_components/ajuste-pv";
import { formatarMod } from "@/lib/ficha";
import { turnoValido } from "@/lib/combate";

export type LinhaCombate = {
  id: string;
  nome: string;
  iniciativa: number;
  modIniciativa: number;
  /** Preenchido só em personagem de jogador. */
  fichaId: string | null;
  pvAtual: number | null;
  pvMax: number | null;
};

const botao =
  "rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground";

export function Combate({
  mesaId,
  combate,
  temJogadores,
}: {
  mesaId: string;
  /** Null quando não há luta em andamento. */
  combate: { rodada: number; turno: number; fila: LinhaCombate[] } | null;
  /** Se a mesa tem ao menos um jogador com ficha para puxar para a fila. */
  temJogadores: boolean;
}) {
  if (!combate) {
    return (
      <section className="mt-8 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Iniciativa
        </h2>
        <p className="mt-2 text-sm text-muted">
          {temJogadores
            ? "Começar o combate monta a fila com os personagens da mesa e rola 1d20 + iniciativa por cada um. Quem rolou o próprio dado é só corrigir o número na linha."
            : "Nenhum jogador com ficha vinculada — a fila começaria vazia. Dá para começar assim e acrescentar monstros à mão."}
        </p>
        <form action={iniciarCombate} className="mt-4">
          <input type="hidden" name="mesaId" value={mesaId} />
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Começar combate
          </button>
        </form>
      </section>
    );
  }

  const total = combate.fila.length;
  const vez = turnoValido(combate.turno, total);

  return (
    <section className="mt-8 rounded-xl border border-accent/40 bg-surface p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Iniciativa
          </h2>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent">
            Rodada {combate.rodada}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={voltarTurno}>
            <input type="hidden" name="mesaId" value={mesaId} />
            <button type="submit" className={botao} title="Voltar a vez">
              ← Anterior
            </button>
          </form>
          <form action={avancarTurno}>
            <input type="hidden" name="mesaId" value={mesaId} />
            <button
              type="submit"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Próximo turno →
            </button>
          </form>
          <form action={encerrarCombate}>
            <input type="hidden" name="mesaId" value={mesaId} />
            <button
              type="submit"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-red-400 hover:text-red-400"
              title="Encerrar apaga a fila"
            >
              Encerrar
            </button>
          </form>
        </div>
      </header>

      {total === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Fila vazia. Acrescente monstros ou NPCs abaixo.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 text-left font-medium">#</th>
                <th className="pb-2 text-left font-medium">Combatente</th>
                <th className="pb-2 text-center font-medium">Inic.</th>
                <th className="pb-2 text-center font-medium">Mod.</th>
                <th className="pb-2 text-center font-medium">PV</th>
                <th className="pb-2 text-right font-medium">Sai</th>
              </tr>
            </thead>
            <tbody>
              {combate.fila.map((linha, i) => {
                const agindo = i === vez;
                return (
                  <tr
                    key={linha.id}
                    className={
                      agindo
                        ? "border-b border-border/50 bg-accent/10 last:border-0"
                        : "border-b border-border/50 last:border-0"
                    }
                  >
                    <td className="py-2 pl-2 pr-3 text-muted">
                      {agindo ? (
                        <span className="font-semibold text-accent" title="Vez de agir">
                          ▶
                        </span>
                      ) : (
                        i + 1
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <span className={agindo ? "font-semibold" : "font-medium"}>
                        {linha.nome}
                      </span>
                      {!linha.fichaId && (
                        <span className="ml-2 text-xs text-muted">NPC</span>
                      )}
                    </td>
                    <td className="px-2 text-center">
                      <form
                        action={definirIniciativa}
                        className="flex items-center justify-center"
                      >
                        <input type="hidden" name="mesaId" value={mesaId} />
                        <input
                          type="hidden"
                          name="participanteId"
                          value={linha.id}
                        />
                        <input
                          type="number"
                          name="iniciativa"
                          defaultValue={linha.iniciativa}
                          aria-label={`Iniciativa de ${linha.nome}`}
                          className="w-14 rounded border border-border bg-background px-1 py-0.5 text-center"
                        />
                        <button
                          type="submit"
                          className="ml-1 rounded border border-border px-1.5 py-0.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-foreground"
                          title={`Corrigir a iniciativa de ${linha.nome}`}
                        >
                          ok
                        </button>
                      </form>
                    </td>
                    <td className="px-2 text-center text-muted">
                      {formatarMod(linha.modIniciativa)}
                    </td>
                    <td className="px-2 text-center">
                      {linha.fichaId ? (
                        <AjustePv
                          fichaId={linha.fichaId}
                          mesaId={mesaId}
                          nome={linha.nome}
                          atual={linha.pvAtual}
                          maximo={linha.pvMax ?? 0}
                        />
                      ) : linha.pvAtual == null ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <PvAvulso
                          mesaId={mesaId}
                          participanteId={linha.id}
                          nome={linha.nome}
                          atual={linha.pvAtual}
                          maximo={linha.pvMax ?? 0}
                        />
                      )}
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <form action={removerParticipante}>
                        <input type="hidden" name="mesaId" value={mesaId} />
                        <input
                          type="hidden"
                          name="participanteId"
                          value={linha.id}
                        />
                        <button
                          type="submit"
                          className="rounded border border-border px-1.5 py-0.5 text-xs text-muted transition-colors hover:border-red-400 hover:text-red-400"
                          title={`Tirar ${linha.nome} do combate`}
                        >
                          ✕
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Monstro ou NPC entrando na luta */}
      <form
        action={adicionarAvulso}
        className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4"
      >
        <input type="hidden" name="mesaId" value={mesaId} />
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">
            Monstro ou NPC
          </span>
          <input
            type="text"
            name="nome"
            required
            placeholder="Goblin 1"
            className="w-44 rounded border border-border bg-background px-2 py-1 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">
            Iniciativa
          </span>
          <input
            type="number"
            name="iniciativa"
            defaultValue={0}
            className="w-20 rounded border border-border bg-background px-2 py-1 text-center text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">
            PV (opcional)
          </span>
          <input
            type="number"
            name="pv"
            min={1}
            placeholder="—"
            className="w-20 rounded border border-border bg-background px-2 py-1 text-center text-sm"
          />
        </label>
        <button type="submit" className={botao}>
          Acrescentar
        </button>
      </form>

      <p className="mt-3 text-xs text-muted">
        A fila ordena por iniciativa; empate resolve pelo maior modificador,
        como no 3.5. Passar do último da fila vira a rodada. Dano e cura de
        personagem vão para a ficha, como no painel acima, e não entram no
        histórico.
      </p>
    </section>
  );
}

/** PV de quem não tem ficha: mesmos dois botões, outra ação. */
function PvAvulso({
  mesaId,
  participanteId,
  nome,
  atual,
  maximo,
}: {
  mesaId: string;
  participanteId: string;
  nome: string;
  atual: number;
  maximo: number;
}) {
  const morrendo = atual < 0;
  const ferido = !morrendo && maximo > 0 && atual <= maximo / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={
          morrendo ? "font-semibold text-red-500" : ferido ? "text-red-400" : ""
        }
      >
        {atual}
        <span className="text-muted">/{maximo > 0 ? maximo : "?"}</span>
      </span>
      {morrendo && (
        <span className="text-[10px] uppercase tracking-wide text-red-500">
          {atual <= -10 ? "morto" : "morrendo"}
        </span>
      )}
      <form action={ajustarPvAvulso} className="flex items-center gap-1">
        <input type="hidden" name="mesaId" value={mesaId} />
        <input type="hidden" name="participanteId" value={participanteId} />
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
