"use client";

// Ficha de personagem de D&D 3.5, no formato da ficha oficial.
//
// Todo o estado vive num único objeto `dados`, serializado como JSON num input
// escondido — o servidor normaliza tudo em `lerDados`. Isso permite que
// qualquer campo participe dos cálculos derivados sem gerenciar dezenas de
// estados separados.

import { useActionState, useState } from "react";
import { salvarFicha, type EstadoFicha } from "@/app/dnd35/fichas/actions";
import {
  Campo,
  Derivado,
  Numero,
  Secao,
  Selecao,
  Texto,
  inputCls,
} from "@/app/dnd35/fichas/_components/campos";
import { ListaEditavel } from "@/app/dnd35/fichas/_components/lista-editavel";
import { SecaoPericias } from "@/app/dnd35/fichas/_components/secao-pericias";
import { bbaProgressivo } from "@/lib/dnd35/classes";
import type { CatalogoFicha } from "@/lib/catalogo";
import {
  ALINHAMENTOS,
  ATRIBUTOS,
  ESCOLAS_MAGIA,
  TAMANHOS,
  agarrarAuto,
  ataqueCorpoAuto,
  ataqueDistanciaAuto,
  caDesprevenidoAuto,
  caToqueAuto,
  caTotalAuto,
  cargasAuto,
  cdMagiaAuto,
  desAplicadaCa,
  falhaMagiaAuto,
  fortitudeAuto,
  formatarMod,
  iniciativaAuto,
  modAtributo,
  modificador,
  penalidadeArmaduraAuto,
  pvMaxAuto,
  PERICIAS,
  pesoTotalAuto,
  reflexosAuto,
  vontadeAuto,
  bbaAuto,
  nivelTotal,
  periciasDeClasse,
  resistenciaBaseAuto,
  type Arma,
  type Armadura,
  type ClasseNivel,
  type DadosFicha,
  type HabilidadeEspecial,
  type Item,
  type Magia,
  type Talento,
} from "@/lib/ficha";

export function FichaForm({
  id,
  nome: nomeInicial,
  dados: dadosIniciais,
  catalogo,
}: {
  id: string;
  nome: string;
  dados: DadosFicha;
  catalogo: CatalogoFicha;
}) {
  const [estado, action, pendente] = useActionState<EstadoFicha, FormData>(
    salvarFicha,
    undefined,
  );

  const [nome, setNome] = useState(nomeInicial);
  const [dados, setDados] = useState<DadosFicha>(dadosIniciais);

  function set<K extends keyof DadosFicha>(campo: K, valor: DadosFicha[K]) {
    setDados((d) => ({ ...d, [campo]: valor }));
  }

  // --- Autopreenchimento a partir do catálogo ---

  const racaEscolhida = catalogo.racas.find((r) => r.nome === dados.raca);

  /**
   * Escolher a raça preenche tamanho, deslocamento e idiomas, e acrescenta os
   * traços raciais às habilidades. Os ajustes de atributo NÃO são somados
   * sozinhos — o jogador informa o valor final, e a ficha só lembra o ajuste.
   */
  function escolherRaca(nome: string) {
    const entrada = catalogo.racas.find((r) => r.nome === nome);
    if (!entrada) {
      set("raca", nome);
      return;
    }
    const r = entrada.dados;
    setDados((d) => {
      const jaTem = new Set(d.habilidades.map((h) => h.nome));
      const novos = r.tracos.filter((t) => !jaTem.has(t.nome));
      return {
        ...d,
        raca: entrada.nome,
        racaId: r.id ?? "",
        tamanho: r.tamanho || d.tamanho,
        deslocamento: r.deslocamento || d.deslocamento,
        // Não sobrescreve idiomas já digitados.
        idiomas: d.idiomas.trim() === "" ? r.idiomas : d.idiomas,
        habilidades: [...d.habilidades, ...novos],
      };
    });
  }

  function atualizarClasse(indice: number, mudanca: Partial<ClasseNivel>) {
    set(
      "classes",
      dados.classes.map((c, i) => (i === indice ? { ...c, ...mudanca } : c)),
    );
  }

  const idsPericiasClasse = periciasDeClasse(dados);
  const bbaCalculado = bbaAuto(dados);
  const nivel = nivelTotal(dados);

  const cargas = cargasAuto(dados);
  const pesoAtual = dados.pesoTotal ?? pesoTotalAuto(dados);
  const limiteLeve = dados.cargaLeve ?? cargas.leve;
  const limiteMedia = dados.cargaMedia ?? cargas.media;
  const limitePesada = dados.cargaPesada ?? cargas.pesada;
  const faixaCarga =
    pesoAtual <= limiteLeve
      ? "leve"
      : pesoAtual <= limiteMedia
        ? "média"
        : pesoAtual <= limitePesada
          ? "pesada"
          : "acima do limite";

  return (
    <form action={action} className="space-y-6 pb-24">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="nome" value={nome} />
      <input type="hidden" name="dados" value={JSON.stringify(dados)} />

      {/* ---------------- Identidade ---------------- */}
      <Secao titulo="Identidade">
        <div className="grid gap-4 sm:grid-cols-6">
          <Campo rotulo="Personagem" className="sm:col-span-3">
            <Texto valor={nome} aoMudar={setNome} maxLength={80} />
          </Campo>
          <Campo rotulo="Jogador" className="sm:col-span-3">
            <Texto valor={dados.jogador} aoMudar={(v) => set("jogador", v)} />
          </Campo>

          <Campo rotulo="Raça" className="sm:col-span-2">
            <Selecao
              valor={dados.raca}
              aoMudar={escolherRaca}
              opcoes={catalogo.racas.map((r) => ({
                valor: r.nome,
                rotulo: r.daMesa ? `${r.nome} (da mesa)` : r.nome,
              }))}
            />
          </Campo>
          <Campo rotulo="Tamanho" className="sm:col-span-1">
            <Selecao
              valor={dados.tamanho}
              aoMudar={(v) => set("tamanho", v)}
              opcoes={TAMANHOS.map((t) => ({ valor: t.id, rotulo: t.nome }))}
            />
          </Campo>
          <Campo rotulo="Deslocamento" className="sm:col-span-1" dica="Ex.: 9 m">
            <Texto
              valor={dados.deslocamento}
              aoMudar={(v) => set("deslocamento", v)}
            />
          </Campo>
          <Campo rotulo="Nível total" className="sm:col-span-2">
            <p className="mt-1 rounded-lg border border-border bg-background/40 px-3 py-2 text-center text-sm font-semibold text-accent">
              {nivel === 0 ? "—" : nivel}
            </p>
          </Campo>

          {racaEscolhida && (
            <div className="sm:col-span-6 rounded-lg border border-border bg-background/40 px-4 py-3 text-xs">
              {Object.keys(racaEscolhida.dados.ajustes).length > 0 ? (
                <p>
                  <span className="text-muted">Ajustes de {racaEscolhida.nome}:</span>{" "}
                  {ATRIBUTOS.filter(
                    (a) => racaEscolhida.dados.ajustes[a.chave] != null,
                  )
                    .map(
                      (a) =>
                        `${a.abrev} ${formatarMod(racaEscolhida.dados.ajustes[a.chave]!)}`,
                    )
                    .join(" · ")}
                  <span className="ml-2 text-muted">
                    (informe o valor final do atributo — a ficha não soma sozinha)
                  </span>
                </p>
              ) : (
                <p className="text-muted">
                  {racaEscolhida.nome} não tem ajustes de atributo.
                </p>
              )}
              {Object.keys(racaEscolhida.dados.periciasBonus).length > 0 && (
                <p className="mt-1">
                  <span className="text-muted">Bônus raciais de perícia:</span>{" "}
                  {Object.entries(racaEscolhida.dados.periciasBonus)
                    .map(
                      ([id, v]) =>
                        `${PERICIAS.find((p) => p.id === id)?.nome ?? id} ${formatarMod(v)}`,
                    )
                    .join(" · ")}
                  <span className="ml-2 text-muted">
                    (lance na coluna “diversos” das perícias)
                  </span>
                </p>
              )}
            </div>
          )}

          <Campo rotulo="Alinhamento" className="sm:col-span-2">
            <Selecao
              valor={dados.alinhamento}
              aoMudar={(v) => set("alinhamento", v)}
              opcoes={ALINHAMENTOS.map((a) => ({ valor: a, rotulo: a }))}
            />
          </Campo>
          <Campo rotulo="Divindade" className="sm:col-span-2">
            <Texto valor={dados.divindade} aoMudar={(v) => set("divindade", v)} />
          </Campo>
          <Campo rotulo="Idiomas" className="sm:col-span-2">
            <Texto
              valor={dados.idiomas}
              aoMudar={(v) => set("idiomas", v)}
              placeholder="Comum, Élfico…"
            />
          </Campo>

          <Campo rotulo="Idade" className="sm:col-span-1">
            <Texto valor={dados.idade} aoMudar={(v) => set("idade", v)} />
          </Campo>
          <Campo rotulo="Sexo" className="sm:col-span-1">
            <Texto valor={dados.sexo} aoMudar={(v) => set("sexo", v)} />
          </Campo>
          <Campo rotulo="Altura" className="sm:col-span-1">
            <Texto valor={dados.altura} aoMudar={(v) => set("altura", v)} />
          </Campo>
          <Campo rotulo="Peso" className="sm:col-span-1">
            <Texto valor={dados.peso} aoMudar={(v) => set("peso", v)} />
          </Campo>
          <Campo rotulo="Olhos" className="sm:col-span-1">
            <Texto valor={dados.olhos} aoMudar={(v) => set("olhos", v)} />
          </Campo>
          <Campo rotulo="Cabelo" className="sm:col-span-1">
            <Texto valor={dados.cabelo} aoMudar={(v) => set("cabelo", v)} />
          </Campo>
          <Campo rotulo="Pele" className="sm:col-span-1">
            <Texto valor={dados.pele} aoMudar={(v) => set("pele", v)} />
          </Campo>
          <Campo rotulo="XP atual" className="sm:col-span-2">
            <Numero valor={dados.xpAtual} aoMudar={(v) => set("xpAtual", v)} />
          </Campo>
          <Campo rotulo="XP para o próximo nível" className="sm:col-span-3">
            <Numero valor={dados.xpProximo} aoMudar={(v) => set("xpProximo", v)} />
          </Campo>
        </div>
      </Secao>

      {/* ---------------- Classes ---------------- */}
      <Secao
        titulo="Classes"
        descricao="BBA, resistências-base e perícias de classe saem daqui. Multiclasse é só somar linhas."
        acessorio={
          nivel > 0 ? (
            <span className="text-xs text-muted">
              BBA calculado: {bbaProgressivo(bbaCalculado)}
            </span>
          ) : undefined
        }
      >
        {dados.classes.length === 0 ? (
          <p className="text-sm text-muted">
            Nenhuma classe. Sem isso, BBA e resistências ficam por sua conta.
          </p>
        ) : (
          <ul className="space-y-3">
            {dados.classes.map((linha, i) => {
              const c = catalogo.classes.find((x) => x.nome === linha.classe);
              return (
                <li
                  key={i}
                  className="grid items-end gap-3 rounded-lg border border-border bg-background/40 p-4 sm:grid-cols-6"
                >
                  <Campo rotulo="Classe" className="sm:col-span-2">
                    <Selecao
                      valor={linha.classe}
                      aoMudar={(v) => atualizarClasse(i, { classe: v })}
                      opcoes={catalogo.classes.map((x) => ({
                        valor: x.nome,
                        rotulo: x.daMesa ? `${x.nome} (da mesa)` : x.nome,
                      }))}
                    />
                  </Campo>
                  <Campo rotulo="Nível" className="sm:col-span-1">
                    <Numero
                      valor={linha.nivel}
                      aoMudar={(v) => atualizarClasse(i, { nivel: v })}
                    />
                  </Campo>
                  <div className="sm:col-span-2 text-xs text-muted">
                    {c ? (
                      <>
                        <p>
                          Dado de vida d{c.dados.dadoVida} ·{" "}
                          {c.dados.pontosPericia} pontos de perícia/nível
                        </p>
                        <p>
                          Resistências boas:{" "}
                          {c.dados.resistenciasBoas.join(", ") || "nenhuma"}
                        </p>
                      </>
                    ) : (
                      <p>Escolha uma classe para ver os dados.</p>
                    )}
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "classes",
                          dados.classes.filter((_, j) => j !== i),
                        )
                      }
                      className="text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={() =>
            set("classes", [...dados.classes, { classe: "", nivel: null }])
          }
          className="mt-4 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
        >
          + Adicionar classe
        </button>
      </Secao>

      {/* ---------------- Atributos ---------------- */}
      <Secao
        titulo="Atributos"
        descricao="A coluna temporária cobre buffs e debuffs — quando preenchida, é ela que vale em todas as contas da ficha."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 text-left font-medium">Atributo</th>
                <th className="w-24 pb-2 text-center font-medium">Valor</th>
                <th className="w-16 pb-2 text-center font-medium">Mod.</th>
                <th className="w-24 pb-2 text-center font-medium">Temp.</th>
                <th className="w-16 pb-2 text-center font-medium">Mod. temp.</th>
              </tr>
            </thead>
            <tbody>
              {ATRIBUTOS.map(({ chave, rotulo, abrev }) => {
                const base = dados.atributos[chave];
                const temp = dados.atributosTemp[chave];
                return (
                  <tr key={chave} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5">
                      <span className="font-medium">{abrev}</span>
                      <span className="ml-2 text-xs text-muted">{rotulo}</span>
                    </td>
                    <td className="px-1 py-1">
                      <Numero
                        valor={base}
                        aoMudar={(v) =>
                          set("atributos", { ...dados.atributos, [chave]: v })
                        }
                        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-center text-base font-semibold outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-2 text-center font-semibold text-accent">
                      {base == null ? "—" : formatarMod(modificador(base))}
                    </td>
                    <td className="px-1 py-1">
                      <Numero
                        valor={temp}
                        aoMudar={(v) =>
                          set("atributosTemp", {
                            ...dados.atributosTemp,
                            [chave]: v,
                          })
                        }
                        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-center text-base outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-2 text-center text-muted">
                      {temp == null ? "—" : formatarMod(modificador(temp))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Secao>

      {/* ---------------- Pontos de vida ---------------- */}
      <Secao
        titulo="Pontos de vida"
        descricao="Registre o PV rolado em cada nível — no multiclasse cada classe usa um dado diferente. O máximo sai da soma mais o modificador de Constituição por nível."
      >
        <div className="mb-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label className="block text-xs font-medium text-muted">
              PV rolado por nível
            </label>
            <span className="text-xs text-muted">
              {dados.pvNiveis.length}{" "}
              {dados.pvNiveis.length === 1 ? "nível" : "níveis"} registrados
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            {dados.pvNiveis.map((valor, i) => (
              <div key={i} className="w-16 text-center">
                <span className="block text-[11px] text-muted">{i + 1}º</span>
                <Numero
                  valor={valor}
                  aoMudar={(v) =>
                    set(
                      "pvNiveis",
                      dados.pvNiveis.map((x, j) => (j === i ? v : x)),
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm outline-none focus:border-accent"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("pvNiveis", [...dados.pvNiveis, null])}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
            >
              + nível
            </button>
            {dados.pvNiveis.length > 0 && (
              <button
                type="button"
                onClick={() => set("pvNiveis", dados.pvNiveis.slice(0, -1))}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-400/50 hover:text-red-300"
              >
                − último
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Derivado
            rotulo="PV máximo"
            auto={pvMaxAuto(dados)}
            valor={dados.pvMax}
            aoMudar={(v) => set("pvMax", v)}
            detalhe="Soma dos níveis + CON por nível"
          />
          <Campo rotulo="PV atual">
            <Numero valor={dados.pvAtual} aoMudar={(v) => set("pvAtual", v)} />
          </Campo>
          <Campo rotulo="Dano não-letal">
            <Numero
              valor={dados.danoNaoLetal}
              aoMudar={(v) => set("danoNaoLetal", v)}
            />
          </Campo>
          <Campo rotulo="Redução de dano" dica="Ex.: 5/mágico">
            <Texto
              valor={dados.reducaoDano}
              aoMudar={(v) => set("reducaoDano", v)}
            />
          </Campo>
        </div>
      </Secao>

      {/* ---------------- Classe de armadura ---------------- */}
      <Secao
        titulo="Classe de armadura"
        descricao="Preencha os componentes — os três totais se calculam sozinhos."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Derivado
            rotulo="CA total"
            destaque
            auto={caTotalAuto(dados)}
            valor={dados.caTotal}
            aoMudar={(v) => set("caTotal", v)}
            detalhe="10 + armadura + escudo + DES + tamanho + natural + deflexão + diversos"
          />
          <Derivado
            rotulo="CA de toque"
            destaque
            auto={caToqueAuto(dados)}
            valor={dados.caToque}
            aoMudar={(v) => set("caToque", v)}
            detalhe="Ignora armadura, escudo e armadura natural"
          />
          <Derivado
            rotulo="CA desprevenido"
            destaque
            auto={caDesprevenidoAuto(dados)}
            valor={dados.caDesprevenido}
            aoMudar={(v) => set("caDesprevenido", v)}
            detalhe="Sem o bônus de Destreza"
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-6">
          <Campo rotulo="Bônus de armadura">
            <Numero valor={dados.caArmadura} aoMudar={(v) => set("caArmadura", v)} />
          </Campo>
          <Campo rotulo="Bônus de escudo">
            <Numero valor={dados.caEscudo} aoMudar={(v) => set("caEscudo", v)} />
          </Campo>
          <Campo rotulo="Armadura natural">
            <Numero valor={dados.caNatural} aoMudar={(v) => set("caNatural", v)} />
          </Campo>
          <Campo rotulo="Deflexão">
            <Numero valor={dados.caDeflexao} aoMudar={(v) => set("caDeflexao", v)} />
          </Campo>
          <Campo rotulo="Diversos">
            <Numero valor={dados.caMisc} aoMudar={(v) => set("caMisc", v)} />
          </Campo>
          <Campo
            rotulo="DES aplicada"
            dica={
              dados.armaduras.some((a) => a.desMax != null)
                ? "Limitada pelo DES máx. da armadura"
                : "Modificador de Destreza"
            }
          >
            <p className="mt-1 rounded-lg border border-border bg-background/40 px-3 py-2 text-center text-sm font-semibold text-accent">
              {formatarMod(desAplicadaCa(dados))}
            </p>
          </Campo>
        </div>
      </Secao>

      {/* ---------------- Iniciativa e deslocamento ---------------- */}
      <Secao titulo="Iniciativa">
        <div className="grid gap-4 sm:grid-cols-3">
          <Derivado
            rotulo="Iniciativa"
            auto={iniciativaAuto(dados)}
            valor={dados.iniciativaTotal}
            aoMudar={(v) => set("iniciativaTotal", v)}
            formatar={formatarMod}
            detalhe="DES + diversos"
          />
          <Campo rotulo="Diversos (iniciativa)" dica="Ex.: Iniciativa Aprimorada +4">
            <Numero
              valor={dados.iniciativaMisc}
              aoMudar={(v) => set("iniciativaMisc", v)}
            />
          </Campo>
        </div>
      </Secao>

      {/* ---------------- Testes de resistência ---------------- */}
      <Secao
        titulo="Testes de resistência"
        descricao="Total = base + atributo + mágico + diversos."
      >
        <div className="space-y-5">
          {(
            [
              {
                nome: "Fortitude",
                chave: "fortitude",
                atributo: "constituicao",
                attr: "CON",
                auto: fortitudeAuto(dados),
                total: dados.fortTotal,
                setTotal: (v: number | null) => set("fortTotal", v),
                base: dados.fortBase,
                setBase: (v: number | null) => set("fortBase", v),
                magico: dados.fortMagico,
                setMagico: (v: number | null) => set("fortMagico", v),
                misc: dados.fortMisc,
                setMisc: (v: number | null) => set("fortMisc", v),
              },
              {
                nome: "Reflexos",
                chave: "reflexos",
                atributo: "destreza",
                attr: "DES",
                auto: reflexosAuto(dados),
                total: dados.refTotal,
                setTotal: (v: number | null) => set("refTotal", v),
                base: dados.refBase,
                setBase: (v: number | null) => set("refBase", v),
                magico: dados.refMagico,
                setMagico: (v: number | null) => set("refMagico", v),
                misc: dados.refMisc,
                setMisc: (v: number | null) => set("refMisc", v),
              },
              {
                nome: "Vontade",
                chave: "vontade",
                atributo: "sabedoria",
                attr: "SAB",
                auto: vontadeAuto(dados),
                total: dados.vonTotal,
                setTotal: (v: number | null) => set("vonTotal", v),
                base: dados.vonBase,
                setBase: (v: number | null) => set("vonBase", v),
                magico: dados.vonMagico,
                setMagico: (v: number | null) => set("vonMagico", v),
                misc: dados.vonMisc,
                setMisc: (v: number | null) => set("vonMisc", v),
              },
            ] as const
          ).map((t) => (
            <div key={t.nome} className="grid gap-4 sm:grid-cols-5">
              <Derivado
                rotulo={t.nome}
                auto={t.auto}
                valor={t.total}
                aoMudar={t.setTotal}
                formatar={formatarMod}
                detalhe={`base + ${t.attr} + mágico + diversos`}
              />
              <Campo
                rotulo="Base"
                dica={nivel > 0 ? "das classes" : undefined}
              >
                <input
                  type="number"
                  value={t.base ?? ""}
                  onChange={(e) =>
                    t.setBase(e.target.value === "" ? null : Number(e.target.value))
                  }
                  placeholder={String(resistenciaBaseAuto(dados, t.chave))}
                  aria-label={`Base de ${t.nome}`}
                  className={`${inputCls} ${t.base == null ? "placeholder:text-accent" : ""}`}
                />
              </Campo>
              <Campo rotulo={`Mod. ${t.attr}`}>
                <p className="mt-1 rounded-lg border border-border bg-background/40 px-3 py-2 text-center text-sm text-muted">
                  {formatarMod(modAtributo(dados, t.atributo))}
                </p>
              </Campo>
              <Campo rotulo="Mágico">
                <Numero valor={t.magico} aoMudar={t.setMagico} />
              </Campo>
              <Campo rotulo="Diversos">
                <Numero valor={t.misc} aoMudar={t.setMisc} />
              </Campo>
            </div>
          ))}
        </div>
      </Secao>

      {/* ---------------- Ataque ---------------- */}
      <Secao titulo="Ataque">
        <div className="grid gap-4 sm:grid-cols-4">
          <Campo
            rotulo="BBA"
            dica={
              nivel > 0
                ? `Vazio usa o calculado: ${bbaProgressivo(bbaCalculado)}`
                : "Progressivo: +6/+1"
            }
          >
            <input
              value={dados.bba}
              onChange={(e) => set("bba", e.target.value)}
              placeholder={nivel > 0 ? bbaProgressivo(bbaCalculado) : "+6/+1"}
              className={`${inputCls} ${dados.bba === "" ? "placeholder:text-accent" : ""}`}
            />
          </Campo>
          <Derivado
            rotulo="Ataque corpo a corpo"
            auto={ataqueCorpoAuto(dados)}
            valor={dados.ataqueCorpoTotal}
            aoMudar={(v) => set("ataqueCorpoTotal", v)}
            formatar={formatarMod}
            detalhe="BBA + FOR + tamanho"
          />
          <Derivado
            rotulo="Ataque à distância"
            auto={ataqueDistanciaAuto(dados)}
            valor={dados.ataqueDistanciaTotal}
            aoMudar={(v) => set("ataqueDistanciaTotal", v)}
            formatar={formatarMod}
            detalhe="BBA + DES + tamanho"
          />
          <Derivado
            rotulo="Agarrar"
            auto={agarrarAuto(dados)}
            valor={dados.agarrarTotal}
            aoMudar={(v) => set("agarrarTotal", v)}
            formatar={formatarMod}
            detalhe="BBA + FOR + tamanho especial"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Campo rotulo="Diversos (corpo a corpo)">
            <Numero
              valor={dados.ataqueCorpoMisc}
              aoMudar={(v) => set("ataqueCorpoMisc", v)}
            />
          </Campo>
          <Campo rotulo="Diversos (à distância)">
            <Numero
              valor={dados.ataqueDistanciaMisc}
              aoMudar={(v) => set("ataqueDistanciaMisc", v)}
            />
          </Campo>
          <Campo rotulo="Diversos (agarrar)">
            <Numero
              valor={dados.agarrarMisc}
              aoMudar={(v) => set("agarrarMisc", v)}
            />
          </Campo>
        </div>
      </Secao>

      <ListaEditavel<Arma>
        titulo="Armas"
        descricao="Deixe o ataque em branco para usar o total calculado acima."
        itens={dados.armas}
        aoMudar={(v) => set("armas", v)}
        itemVazio={() => ({
          nome: "",
          bonus: "",
          dano: "",
          critico: "",
          alcance: "",
          tipo: "",
          municao: "",
          notas: "",
        })}
        rotuloAdicionar="Adicionar arma"
        vazio="Nenhuma arma registrada."
        campos={[
          { chave: "nome", rotulo: "Arma", placeholder: "Espada longa", span: "sm:col-span-2" },
          { chave: "bonus", rotulo: "Ataque", placeholder: formatarMod(ataqueCorpoAuto(dados)), span: "sm:col-span-1" },
          { chave: "dano", rotulo: "Dano", placeholder: "1d8+3", span: "sm:col-span-1" },
          { chave: "critico", rotulo: "Crítico", placeholder: "19-20/×2", span: "sm:col-span-1" },
          { chave: "alcance", rotulo: "Alcance", placeholder: "Corpo a corpo", span: "sm:col-span-1" },
          { chave: "tipo", rotulo: "Tipo", placeholder: "Cortante", span: "sm:col-span-2" },
          { chave: "municao", rotulo: "Munição", span: "sm:col-span-1" },
          { chave: "notas", rotulo: "Notas", span: "sm:col-span-3" },
        ]}
      />

      <ListaEditavel<Armadura>
        titulo="Armaduras e escudos"
        descricao="A penalidade e a falha de magia são somadas automaticamente."
        itens={dados.armaduras}
        aoMudar={(v) => set("armaduras", v)}
        itemVazio={() => ({
          nome: "",
          tipo: "",
          bonusCa: null,
          desMax: null,
          penalidade: null,
          falhaMagia: null,
          deslocamento: "",
          peso: null,
        })}
        rotuloAdicionar="Adicionar armadura"
        vazio="Sem armadura equipada."
        rodape={
          <span className="text-xs text-muted">
            Penalidade somada: {penalidadeArmaduraAuto(dados)} · Falha de magia:{" "}
            {falhaMagiaAuto(dados)}%
          </span>
        }
        campos={[
          { chave: "nome", rotulo: "Armadura", placeholder: "Cota de malha", span: "sm:col-span-2" },
          { chave: "tipo", rotulo: "Tipo", placeholder: "Média", span: "sm:col-span-1" },
          { chave: "bonusCa", rotulo: "Bônus CA", tipo: "numero", span: "sm:col-span-1" },
          { chave: "desMax", rotulo: "DES máx.", tipo: "numero", span: "sm:col-span-1" },
          { chave: "penalidade", rotulo: "Penalidade", tipo: "numero", placeholder: "-5", span: "sm:col-span-1" },
          { chave: "falhaMagia", rotulo: "Falha de magia %", tipo: "numero", span: "sm:col-span-2" },
          { chave: "deslocamento", rotulo: "Deslocamento", span: "sm:col-span-2" },
          { chave: "peso", rotulo: "Peso (kg)", tipo: "numero", span: "sm:col-span-2" },
        ]}
      />

      {/* ---------------- Perícias ---------------- */}
      <SecaoPericias
        dados={dados}
        aoMudar={set}
        periciasClasse={idsPericiasClasse}
      />

      {/* ---------------- Talentos e habilidades ---------------- */}
      <ListaEditavel<Talento>
        titulo="Talentos"
        itens={dados.talentos}
        aoMudar={(v) => set("talentos", v)}
        itemVazio={() => ({ nome: "", notas: "" })}
        rotuloAdicionar="Adicionar talento"
        vazio="Nenhum talento registrado."
        campos={[
          { chave: "nome", rotulo: "Talento", placeholder: "Ataque Poderoso", span: "sm:col-span-2" },
          { chave: "notas", rotulo: "Efeito", span: "sm:col-span-4" },
        ]}
      />

      <ListaEditavel<HabilidadeEspecial>
        titulo="Habilidades especiais"
        descricao="Habilidades de classe e raça: visão no escuro, esquiva sobrenatural, ataque furtivo…"
        itens={dados.habilidades}
        aoMudar={(v) => set("habilidades", v)}
        itemVazio={() => ({ nome: "", notas: "" })}
        rotuloAdicionar="Adicionar habilidade"
        vazio="Nenhuma habilidade registrada."
        campos={[
          { chave: "nome", rotulo: "Habilidade", placeholder: "Ataque furtivo +2d6", span: "sm:col-span-2" },
          { chave: "notas", rotulo: "Descrição", span: "sm:col-span-4" },
        ]}
      />

      {/* ---------------- Equipamento ---------------- */}
      <ListaEditavel<Item>
        titulo="Equipamento"
        itens={dados.equipamento}
        aoMudar={(v) => set("equipamento", v)}
        itemVazio={() => ({ nome: "", qtd: null, peso: null, notas: "" })}
        rotuloAdicionar="Adicionar item"
        vazio="Mochila vazia."
        campos={[
          { chave: "nome", rotulo: "Item", placeholder: "Corda de seda", span: "sm:col-span-2" },
          { chave: "qtd", rotulo: "Qtd.", tipo: "numero", span: "sm:col-span-1" },
          { chave: "peso", rotulo: "Peso unit. (kg)", tipo: "numero", span: "sm:col-span-1" },
          { chave: "notas", rotulo: "Notas", span: "sm:col-span-2" },
        ]}
      />

      <Secao titulo="Dinheiro e carga">
        <div className="grid gap-4 sm:grid-cols-4">
          {(
            [
              ["pl", "Platina (PL)"],
              ["po", "Ouro (PO)"],
              ["pp", "Prata (PP)"],
              ["pc", "Cobre (PC)"],
            ] as const
          ).map(([chave, rotulo]) => (
            <Campo key={chave} rotulo={rotulo}>
              <Numero
                valor={dados.dinheiro[chave]}
                aoMudar={(v) =>
                  set("dinheiro", { ...dados.dinheiro, [chave]: v })
                }
              />
            </Campo>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <Derivado
            rotulo="Peso carregado (kg)"
            auto={pesoTotalAuto(dados)}
            valor={dados.pesoTotal}
            aoMudar={(v) => set("pesoTotal", v)}
            detalhe="Itens + armaduras + moedas"
          />
          <Derivado
            rotulo="Carga leve (kg)"
            auto={cargas.leve}
            valor={dados.cargaLeve}
            aoMudar={(v) => set("cargaLeve", v)}
            detalhe="Até 1/3 da capacidade"
          />
          <Derivado
            rotulo="Carga média (kg)"
            auto={cargas.media}
            valor={dados.cargaMedia}
            aoMudar={(v) => set("cargaMedia", v)}
            detalhe="Até 2/3 da capacidade"
          />
          <Derivado
            rotulo="Carga pesada (kg)"
            auto={cargas.pesada}
            valor={dados.cargaPesada}
            aoMudar={(v) => set("cargaPesada", v)}
            detalhe="Capacidade máxima, por FOR"
          />
        </div>

        <p className="mt-4 rounded-lg border border-border bg-background/40 px-4 py-3 text-sm">
          Carga atual:{" "}
          <span
            className={
              faixaCarga === "acima do limite"
                ? "font-semibold text-red-400"
                : faixaCarga === "leve"
                  ? "font-semibold text-green-400"
                  : "font-semibold text-accent"
            }
          >
            {faixaCarga}
          </span>{" "}
          <span className="text-muted">
            ({pesoAtual} kg de {limitePesada} kg)
          </span>
        </p>
      </Secao>

      {/* ---------------- Conjuração ---------------- */}
      <Secao
        titulo="Conjuração"
        descricao="Preencha só se o personagem lança magias. A CD sai de 10 + nível da magia + modificador do atributo-chave."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Classe conjuradora">
            <Texto
              valor={dados.conjuracaoClasse}
              aoMudar={(v) => set("conjuracaoClasse", v)}
              placeholder="Ex.: Mago 5"
            />
          </Campo>
          <Campo rotulo="Atributo-chave">
            <Selecao
              valor={dados.conjuracaoAtributo}
              aoMudar={(v) => set("conjuracaoAtributo", v)}
              opcoes={ATRIBUTOS.map((a) => ({
                valor: a.chave,
                rotulo: a.rotulo,
              }))}
            />
          </Campo>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 text-left font-medium">Nível</th>
                <th className="pb-2 text-center font-medium">Conhecidas</th>
                <th className="pb-2 text-center font-medium">Por dia</th>
                <th className="w-28 pb-2 text-center font-medium">CD</th>
              </tr>
            </thead>
            <tbody>
              {dados.magiasPorNivel.map((linha, nivel) => {
                const cdAuto = cdMagiaAuto(dados, nivel);
                return (
                  <tr key={nivel} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 font-medium">{nivel}º</td>
                    <td className="px-1 py-1">
                      <input
                        value={linha.conhecidas}
                        onChange={(e) => {
                          const novo = [...dados.magiasPorNivel];
                          novo[nivel] = { ...linha, conhecidas: e.target.value };
                          set("magiasPorNivel", novo);
                        }}
                        aria-label={`Magias conhecidas de nível ${nivel}`}
                        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        value={linha.porDia}
                        onChange={(e) => {
                          const novo = [...dados.magiasPorNivel];
                          novo[nivel] = { ...linha, porDia: e.target.value };
                          set("magiasPorNivel", novo);
                        }}
                        aria-label={`Magias por dia de nível ${nivel}`}
                        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="number"
                        value={linha.cd ?? ""}
                        onChange={(e) => {
                          const novo = [...dados.magiasPorNivel];
                          novo[nivel] = {
                            ...linha,
                            cd: e.target.value === "" ? null : Number(e.target.value),
                          };
                          set("magiasPorNivel", novo);
                        }}
                        placeholder={String(cdAuto)}
                        aria-label={`CD das magias de nível ${nivel}`}
                        className={`w-full rounded-lg border bg-background px-2 py-1.5 text-center text-sm outline-none focus:border-accent ${
                          linha.cd != null
                            ? "border-accent/60"
                            : "border-border placeholder:text-accent"
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Secao>

      <ListaEditavel<Magia>
        titulo="Magias"
        itens={dados.magias}
        aoMudar={(v) => set("magias", v)}
        itemVazio={() => ({
          nome: "",
          nivel: "",
          escola: "",
          preparadas: "",
          notas: "",
        })}
        rotuloAdicionar="Adicionar magia"
        vazio="Nenhuma magia registrada."
        campos={[
          { chave: "nome", rotulo: "Magia", placeholder: "Mísseis Mágicos", span: "sm:col-span-2" },
          { chave: "nivel", rotulo: "Nível", placeholder: "1", span: "sm:col-span-1" },
          { chave: "escola", rotulo: "Escola", tipo: "select", opcoes: ESCOLAS_MAGIA, span: "sm:col-span-2" },
          { chave: "preparadas", rotulo: "Preparadas", span: "sm:col-span-1" },
          { chave: "notas", rotulo: "Notas", span: "sm:col-span-6" },
        ]}
      />

      {/* Barra de salvar fixa — a ficha é longa. */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <button
            type="submit"
            disabled={pendente}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {pendente ? "Salvando…" : "Salvar ficha"}
          </button>
          <span aria-live="polite" className="text-sm">
            {estado?.erro && <span className="text-red-400">{estado.erro}</span>}
            {estado?.ok && <span className="text-green-400">Salvo!</span>}
          </span>
        </div>
      </div>
    </form>
  );
}
