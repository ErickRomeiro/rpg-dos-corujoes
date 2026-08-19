"use client";

import { useState } from "react";
import {
  analisar,
  formatarTermos,
  rolar,
  type Resultado,
  type Termo,
} from "@/lib/dados";

type Registro = {
  id: number;
  expressao: string;
  resultado: Resultado;
  /** Detalhe do d20 solitário: crítico natural ou falha natural. */
  natural: "20" | "1" | null;
};

const DADOS_RAPIDOS = [4, 6, 8, 10, 12, 20, 100];

/** d20 puro (sem outros dados) merece destaque de 20/1 natural. */
function naturalDe(termos: Termo[], resultado: Resultado): "20" | "1" | null {
  const dados = termos.filter((t) => t.tipo === "dado");
  if (dados.length !== 1) return null;
  const unico = dados[0];
  if (unico.tipo !== "dado" || unico.faces !== 20 || unico.quantidade !== 1) {
    return null;
  }
  const valor = resultado.partes.find((p) => p.termo === unico)?.valores[0];
  if (valor === 20) return "20";
  if (valor === 1) return "1";
  return null;
}

export function Rolador() {
  const [expressao, setExpressao] = useState("1d20");
  const [erro, setErro] = useState<string | null>(null);
  const [historico, setHistorico] = useState<Registro[]>([]);
  const [proximoId, setProximoId] = useState(1);

  function rolarExpressao(texto: string) {
    const analise = analisar(texto);
    if (!analise.ok) {
      setErro(analise.erro);
      return;
    }

    const resultado = rolar(analise.termos);
    setErro(null);
    setHistorico((h) =>
      [
        {
          id: proximoId,
          expressao: formatarTermos(analise.termos),
          resultado,
          natural: naturalDe(analise.termos, resultado),
        },
        ...h,
      ].slice(0, 30),
    );
    setProximoId((n) => n + 1);
  }

  const ultima = historico[0];

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Rolagem
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            rolarExpressao(expressao);
          }}
          className="mt-4 flex flex-wrap gap-3"
        >
          <input
            value={expressao}
            onChange={(e) => {
              setExpressao(e.target.value);
              setErro(null);
            }}
            aria-label="Expressão de dado"
            placeholder="2d6+3"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-strong"
          >
            Rolar
          </button>
        </form>

        {erro && <p className="mt-2 text-sm text-red-400">{erro}</p>}

        <div className="mt-4">
          <p className="text-xs text-muted">Atalhos</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DADOS_RAPIDOS.map((faces) => (
              <button
                key={faces}
                type="button"
                onClick={() => {
                  setExpressao(`1d${faces}`);
                  rolarExpressao(`1d${faces}`);
                }}
                className="rounded-full border border-border px-4 py-1.5 font-mono text-sm text-muted transition-colors hover:border-accent/50 hover:text-foreground"
              >
                d{faces}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-muted">
          Aceita somas e subtrações: <code className="font-mono">1d20+5</code>,{" "}
          <code className="font-mono">2d6+1d4+2</code>,{" "}
          <code className="font-mono">1d20-1</code>.
        </p>
      </section>

      {/* Último resultado, grande */}
      {ultima && (
        <section
          aria-live="polite"
          className={`rounded-xl border p-6 text-center ${
            ultima.natural === "20"
              ? "border-green-400/50 bg-green-400/10"
              : ultima.natural === "1"
                ? "border-red-400/50 bg-red-400/10"
                : "border-border bg-surface"
          }`}
        >
          <p className="font-mono text-sm text-muted">{ultima.expressao}</p>
          <p className="mt-1 text-5xl font-bold tabular-nums">
            {ultima.resultado.total}
          </p>
          <p className="mt-2 font-mono text-xs text-muted">
            {detalhar(ultima.resultado)}
          </p>
          {ultima.natural === "20" && (
            <p className="mt-2 text-sm font-semibold text-green-400">
              20 natural!
            </p>
          )}
          {ultima.natural === "1" && (
            <p className="mt-2 text-sm font-semibold text-red-400">
              1 natural — falha automática.
            </p>
          )}
        </section>
      )}

      {/* Histórico da sessão */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Histórico da sessão
          </h2>
          {historico.length > 0 && (
            <button
              type="button"
              onClick={() => setHistorico([])}
              className="text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              Limpar
            </button>
          )}
        </div>

        {historico.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Nada rolado ainda. O histórico vive só nesta aba — recarregou, zerou.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {historico.map((registro) => (
              <li
                key={registro.id}
                className="flex items-baseline justify-between gap-4 py-2"
              >
                <span className="min-w-0">
                  <span className="font-mono text-sm">{registro.expressao}</span>
                  <span className="ml-2 font-mono text-xs text-muted">
                    {detalhar(registro.resultado)}
                  </span>
                </span>
                <span
                  className={`shrink-0 font-semibold tabular-nums ${
                    registro.natural === "20"
                      ? "text-green-400"
                      : registro.natural === "1"
                        ? "text-red-400"
                        : "text-accent"
                  }`}
                >
                  {registro.resultado.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** "2d6+3" → "[4, 5] + 3" */
function detalhar(resultado: Resultado): string {
  return resultado.partes
    .map((parte, i) => {
      const sinal = parte.termo.sinal === -1 ? "−" : "+";
      const corpo =
        parte.termo.tipo === "dado"
          ? `[${parte.valores.join(", ")}]`
          : String(parte.termo.valor);
      if (i === 0) return parte.termo.sinal === -1 ? `−${corpo}` : corpo;
      return ` ${sinal} ${corpo}`;
    })
    .join("");
}
