"use client";

import { useActionState, useState } from "react";
import { salvarFicha, type EstadoFicha } from "@/app/dnd35/fichas/actions";
import {
  ALINHAMENTOS,
  ATRIBUTOS,
  formatarMod,
  modificador,
  type Atributos,
  type DadosFicha,
} from "@/lib/ficha";

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export function FichaForm({
  id,
  nome,
  dados,
}: {
  id: string;
  nome: string;
  dados: DadosFicha;
}) {
  const [estado, action, pendente] = useActionState<EstadoFicha, FormData>(
    salvarFicha,
    undefined,
  );

  // Atributos controlados para mostrar o modificador ao vivo.
  const [attrs, setAttrs] = useState<Record<keyof Atributos, string>>({
    forca: dados.atributos.forca?.toString() ?? "",
    destreza: dados.atributos.destreza?.toString() ?? "",
    constituicao: dados.atributos.constituicao?.toString() ?? "",
    inteligencia: dados.atributos.inteligencia?.toString() ?? "",
    sabedoria: dados.atributos.sabedoria?.toString() ?? "",
    carisma: dados.atributos.carisma?.toString() ?? "",
  });

  const modDes = modificador(attrs.destreza === "" ? null : Number(attrs.destreza));

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="id" value={id} />

      {/* Identidade */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Identidade
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Nome</label>
            <input
              name="nome"
              required
              defaultValue={nome}
              maxLength={80}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Raça</label>
            <input name="raca" defaultValue={dados.raca} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium">Classe e nível</label>
            <input
              name="classeNivel"
              defaultValue={dados.classeNivel}
              placeholder="Ex.: Guerreiro 3"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Alinhamento</label>
            <select
              name="alinhamento"
              defaultValue={dados.alinhamento}
              className={inputCls}
            >
              <option value="">—</option>
              {ALINHAMENTOS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Atributos */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Atributos
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {ATRIBUTOS.map(({ chave, rotulo, abrev }) => {
            const valor = attrs[chave];
            const mod = modificador(valor === "" ? null : Number(valor));
            return (
              <div key={chave} className="text-center">
                <label className="block text-xs font-medium text-muted">
                  {abrev}
                </label>
                <input
                  name={chave}
                  type="number"
                  inputMode="numeric"
                  value={valor}
                  onChange={(e) =>
                    setAttrs((s) => ({ ...s, [chave]: e.target.value }))
                  }
                  aria-label={rotulo}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-center text-lg font-semibold outline-none focus:border-accent"
                />
                <span className="mt-1 block text-sm text-accent">
                  {valor === "" ? "—" : formatarMod(mod)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Combate */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Combate
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">PV atual</label>
            <input
              name="pvAtual"
              type="number"
              defaultValue={dados.pvAtual ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">PV máximo</label>
            <input
              name="pvMax"
              type="number"
              defaultValue={dados.pvMax ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">CA</label>
            <input
              name="ca"
              type="number"
              defaultValue={dados.ca ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Iniciativa{" "}
              <span className="text-xs text-muted">(DES {formatarMod(modDes)})</span>
            </label>
            <input
              name="iniciativa"
              type="number"
              defaultValue={dados.iniciativa ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Deslocamento</label>
            <input
              name="deslocamento"
              defaultValue={dados.deslocamento}
              placeholder="Ex.: 9 m"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Testes de resistência */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Testes de resistência
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Fortitude</label>
            <input
              name="fortitude"
              type="number"
              defaultValue={dados.fortitude ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Reflexos</label>
            <input
              name="reflexos"
              type="number"
              defaultValue={dados.reflexos ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Vontade</label>
            <input
              name="vontade"
              type="number"
              defaultValue={dados.vontade ?? ""}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pendente}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pendente ? "Salvando…" : "Salvar ficha"}
        </button>
        {estado?.erro && <span className="text-sm text-red-400">{estado.erro}</span>}
        {estado?.ok && <span className="text-sm text-green-400">Salvo!</span>}
      </div>
    </form>
  );
}
