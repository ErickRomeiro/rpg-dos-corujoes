"use client";

// Blocos de formulário compartilhados pelas seções da ficha.

import type { ReactNode } from "react";

export const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function Campo({
  rotulo,
  dica,
  className,
  children,
}: {
  rotulo: string;
  dica?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted">{rotulo}</label>
      {children}
      {dica && <p className="mt-1 text-[11px] text-muted">{dica}</p>}
    </div>
  );
}

export function Secao({
  titulo,
  descricao,
  acessorio,
  children,
}: {
  titulo: string;
  descricao?: string;
  acessorio?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {titulo}
        </h2>
        {acessorio}
      </div>
      {descricao && <p className="mt-1 text-xs text-muted">{descricao}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Texto({
  valor,
  aoMudar,
  placeholder,
  maxLength,
}: {
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <input
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={inputCls}
    />
  );
}

export function Numero({
  valor,
  aoMudar,
  placeholder,
  className,
}: {
  valor: number | null;
  aoMudar: (v: number | null) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={valor ?? ""}
      onChange={(e) =>
        aoMudar(e.target.value === "" ? null : Number(e.target.value))
      }
      placeholder={placeholder}
      className={className ?? inputCls}
    />
  );
}

/**
 * Select que nunca perde o valor atual.
 *
 * Se a ficha guarda algo que não está na lista — uma classe de campanha, uma
 * raça caseira, conteúdo vindo de outra versão do app — o valor entra como
 * opção própria, marcado como fora do catálogo. Sem isso o navegador exibiria
 * a opção vazia e o dado seria destruído no primeiro salvamento.
 */
export function Selecao({
  valor,
  aoMudar,
  opcoes,
  vazio = "—",
}: {
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: readonly { valor: string; rotulo: string }[];
  vazio?: string;
}) {
  const foraDoCatalogo =
    valor !== "" && !opcoes.some((o) => o.valor === valor);

  return (
    <select
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      className={`${inputCls} ${foraDoCatalogo ? "border-accent/60" : ""}`}
      title={
        foraDoCatalogo
          ? "Este valor não está no catálogo — veio da ficha e foi preservado."
          : undefined
      }
    >
      <option value="">{vazio}</option>
      {foraDoCatalogo && (
        <option value={valor}>{valor} — fora do catálogo</option>
      )}
      {opcoes.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.rotulo}
        </option>
      ))}
    </select>
  );
}

/**
 * Campo derivado: por padrão mostra o valor calculado pela regra do 3.5.
 * Digitar um número sobrescreve o cálculo (regra da casa, caso especial);
 * apagar o campo — ou clicar em "voltar ao automático" — devolve o controle
 * à conta.
 */
export function Derivado({
  rotulo,
  auto,
  valor,
  aoMudar,
  formatar = (n) => String(n),
  detalhe,
  destaque,
}: {
  rotulo: string;
  auto: number;
  valor: number | null;
  aoMudar: (v: number | null) => void;
  formatar?: (n: number) => string;
  /** Explicação da conta, ex.: "10 + armadura + escudo + DES + tamanho". */
  detalhe?: string;
  /** Deixa o número grande — usado nos totais principais (CA, ataque). */
  destaque?: boolean;
}) {
  const sobrescrito = valor != null;
  const efetivo = valor ?? auto;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-xs font-medium text-muted">{rotulo}</label>
        {sobrescrito && (
          <button
            type="button"
            onClick={() => aoMudar(null)}
            className="text-[11px] font-medium text-accent transition-colors hover:text-accent-strong"
            title={`Cálculo automático: ${formatar(auto)}`}
          >
            voltar ao automático
          </button>
        )}
      </div>

      <input
        type="number"
        inputMode="numeric"
        value={valor ?? ""}
        onChange={(e) =>
          aoMudar(e.target.value === "" ? null : Number(e.target.value))
        }
        placeholder={formatar(auto)}
        aria-label={rotulo}
        className={`mt-1 w-full rounded-lg border bg-background px-3 outline-none focus:border-accent ${
          destaque
            ? "py-2 text-center text-2xl font-bold"
            : "py-2 text-sm"
        } ${
          sobrescrito
            ? "border-accent/60 text-foreground"
            : "border-border text-foreground placeholder:text-accent"
        }`}
      />

      <p className="mt-1 text-[11px] text-muted">
        {sobrescrito ? (
          <>manual · calculado dá {formatar(auto)}</>
        ) : (
          <>
            {efetivo === auto && detalhe ? detalhe : "calculado automaticamente"}
          </>
        )}
      </p>
    </div>
  );
}
