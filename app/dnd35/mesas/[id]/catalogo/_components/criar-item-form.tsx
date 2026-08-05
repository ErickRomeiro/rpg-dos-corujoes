"use client";

// Cadastro de conteúdo próprio da mesa. Os campos mudam conforme o tipo — o
// que é montado aqui vira o JSON `dados` do ItemCatalogo, no mesmo formato das
// tabelas do SRD em lib/dnd35/. Assim o autopreenchimento da ficha trata
// homebrew e oficial exatamente igual.

import { useActionState, useState } from "react";
import {
  criarItemCatalogo,
  type EstadoCatalogo,
} from "@/app/dnd35/catalogo/actions";
import { PERICIAS, TAMANHOS } from "@/lib/ficha";

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

const TIPOS = [
  { valor: "CLASSE", rotulo: "Classe" },
  { valor: "RACA", rotulo: "Raça" },
  { valor: "ARMA", rotulo: "Arma" },
  { valor: "ARMADURA", rotulo: "Armadura ou escudo" },
  { valor: "TALENTO", rotulo: "Talento" },
  { valor: "ITEM", rotulo: "Item" },
  { valor: "MAGIA", rotulo: "Magia" },
] as const;

type Tipo = (typeof TIPOS)[number]["valor"];

export function CriarItemForm({ mesaId }: { mesaId: string }) {
  const [estado, action, pendente] = useActionState<EstadoCatalogo, FormData>(
    criarItemCatalogo,
    undefined,
  );

  const [tipo, setTipo] = useState<Tipo>("CLASSE");
  const [nome, setNome] = useState("");

  // Campos por tipo, guardados soltos e serializados no envio.
  const [dadoVida, setDadoVida] = useState("");
  const [bba, setBba] = useState("media");
  const [pontosPericia, setPontosPericia] = useState("");
  const [resBoas, setResBoas] = useState<string[]>([]);
  const [periciasClasse, setPericiasClasse] = useState<string[]>([]);

  const [tamanho, setTamanho] = useState("medio");
  const [deslocamento, setDeslocamento] = useState("");
  const [idiomas, setIdiomas] = useState("");

  const [dano, setDano] = useState("");
  const [critico, setCritico] = useState("");
  const [alcance, setAlcance] = useState("");
  const [tipoDano, setTipoDano] = useState("");
  const [peso, setPeso] = useState("");

  const [bonusCa, setBonusCa] = useState("");
  const [desMax, setDesMax] = useState("");
  const [penalidade, setPenalidade] = useState("");
  const [falhaMagia, setFalhaMagia] = useState("");

  const [beneficio, setBeneficio] = useState("");
  const [preRequisito, setPreRequisito] = useState("");

  const num = (v: string) => (v === "" ? null : Number(v));

  /** Monta o JSON no formato que lib/dnd35/ usa para cada tipo. */
  function montarDados(): Record<string, unknown> {
    switch (tipo) {
      case "CLASSE":
        return {
          id: nome.toLowerCase().replace(/\s+/g, ""),
          nome,
          dadoVida: num(dadoVida),
          bba,
          resistenciasBoas: resBoas,
          pontosPericia: num(pontosPericia),
          periciasClasse,
        };
      case "RACA":
        return {
          id: nome.toLowerCase().replace(/\s+/g, ""),
          nome,
          ajustes: {},
          tamanho,
          deslocamento,
          idiomas,
          periciasBonus: {},
          tracos: [],
        };
      case "ARMA":
        return {
          nome,
          categoria: "Exótica",
          dano,
          critico,
          alcance,
          tipo: tipoDano,
          peso: num(peso),
        };
      case "ARMADURA":
        return {
          nome,
          categoria: "Média",
          bonusCa: num(bonusCa),
          desMax: num(desMax),
          penalidade: num(penalidade),
          falhaMagia: num(falhaMagia),
          deslocamento,
          peso: num(peso),
        };
      case "TALENTO":
        return { nome, categoria: "Geral", preRequisito, beneficio };
      case "ITEM":
        return { nome, peso: num(peso) };
      case "MAGIA":
        return { nome, nivel: "", escola: "", notas: beneficio };
    }
  }

  function alternar(lista: string[], valor: string, set: (v: string[]) => void) {
    set(
      lista.includes(valor)
        ? lista.filter((x) => x !== valor)
        : [...lista, valor],
    );
  }

  return (
    <form
      action={action}
      className="rounded-xl border border-border bg-surface p-5"
    >
      <input type="hidden" name="mesaId" value={mesaId} />
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="nome" value={nome} />
      <input type="hidden" name="dados" value={JSON.stringify(montarDados())} />

      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
        Cadastrar conteúdo da mesa
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-muted">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Tipo)}
            className={inputCls}
          >
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.rotulo}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            maxLength={80}
            placeholder="Ex.: Lâmina Maldita"
            className={inputCls}
          />
        </div>
      </div>

      {tipo === "CLASSE" && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-muted">
                Dado de vida
              </label>
              <select
                value={dadoVida}
                onChange={(e) => setDadoVida(e.target.value)}
                className={inputCls}
              >
                <option value="">—</option>
                {[4, 6, 8, 10, 12].map((d) => (
                  <option key={d} value={d}>
                    d{d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted">
                Progressão de BBA
              </label>
              <select
                value={bba}
                onChange={(e) => setBba(e.target.value)}
                className={inputCls}
              >
                <option value="boa">Boa (1 por nível)</option>
                <option value="media">Média (3/4)</option>
                <option value="ruim">Ruim (1/2)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted">
                Pontos de perícia por nível
              </label>
              <input
                type="number"
                value={pontosPericia}
                onChange={(e) => setPontosPericia(e.target.value)}
                placeholder="4"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-muted">
              Resistências boas
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {["fortitude", "reflexos", "vontade"].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={resBoas.includes(r)}
                    onChange={() => alternar(resBoas, r, setResBoas)}
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="capitalize">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-muted">
              Perícias de classe{" "}
              <span className="text-muted">({periciasClasse.length})</span>
            </span>
            <div className="mt-2 grid max-h-56 grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto rounded-lg border border-border bg-background/40 p-3 sm:grid-cols-3">
              {PERICIAS.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={periciasClasse.includes(p.id)}
                    onChange={() =>
                      alternar(periciasClasse, p.id, setPericiasClasse)
                    }
                    className="h-3.5 w-3.5 accent-accent"
                  />
                  <span className="truncate">{p.nome}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {tipo === "RACA" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-muted">Tamanho</label>
            <select
              value={tamanho}
              onChange={(e) => setTamanho(e.target.value)}
              className={inputCls}
            >
              {TAMANHOS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">
              Deslocamento
            </label>
            <input
              value={deslocamento}
              onChange={(e) => setDeslocamento(e.target.value)}
              placeholder="9 m"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Idiomas</label>
            <input
              value={idiomas}
              onChange={(e) => setIdiomas(e.target.value)}
              placeholder="Comum, …"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {tipo === "ARMA" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-5">
          <div>
            <label className="block text-xs font-medium text-muted">Dano</label>
            <input
              value={dano}
              onChange={(e) => setDano(e.target.value)}
              placeholder="1d8"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Crítico</label>
            <input
              value={critico}
              onChange={(e) => setCritico(e.target.value)}
              placeholder="19-20/×2"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Alcance</label>
            <input
              value={alcance}
              onChange={(e) => setAlcance(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Tipo</label>
            <input
              value={tipoDano}
              onChange={(e) => setTipoDano(e.target.value)}
              placeholder="Cortante"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Peso (kg)</label>
            <input
              type="number"
              step="0.25"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {tipo === "ARMADURA" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-5">
          <div>
            <label className="block text-xs font-medium text-muted">Bônus CA</label>
            <input
              type="number"
              value={bonusCa}
              onChange={(e) => setBonusCa(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">DES máx.</label>
            <input
              type="number"
              value={desMax}
              onChange={(e) => setDesMax(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">
              Penalidade
            </label>
            <input
              type="number"
              value={penalidade}
              onChange={(e) => setPenalidade(e.target.value)}
              placeholder="-4"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">
              Falha de magia %
            </label>
            <input
              type="number"
              value={falhaMagia}
              onChange={(e) => setFalhaMagia(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted">Peso (kg)</label>
            <input
              type="number"
              step="0.5"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {tipo === "ITEM" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-muted">Peso (kg)</label>
            <input
              type="number"
              step="0.25"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {(tipo === "TALENTO" || tipo === "MAGIA") && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {tipo === "TALENTO" && (
            <div>
              <label className="block text-xs font-medium text-muted">
                Pré-requisito
              </label>
              <input
                value={preRequisito}
                onChange={(e) => setPreRequisito(e.target.value)}
                placeholder="For 13"
                className={inputCls}
              />
            </div>
          )}
          <div className={tipo === "MAGIA" ? "sm:col-span-2" : ""}>
            <label className="block text-xs font-medium text-muted">
              {tipo === "TALENTO" ? "Benefício" : "Notas"}
            </label>
            <input
              value={beneficio}
              onChange={(e) => setBeneficio(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-4">
        <button
          type="submit"
          disabled={pendente || nome.trim() === ""}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pendente ? "Salvando…" : "Cadastrar"}
        </button>
        <span aria-live="polite" className="text-sm">
          {estado?.erro && <span className="text-red-400">{estado.erro}</span>}
          {estado?.ok && (
            <span className="text-green-400">Cadastrado! Recarregue para ver na lista.</span>
          )}
        </span>
      </div>
    </form>
  );
}
