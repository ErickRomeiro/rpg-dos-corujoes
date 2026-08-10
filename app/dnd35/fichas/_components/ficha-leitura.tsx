// A ficha em modo leitura: para conferir e para imprimir.
//
// É um layout próprio, e não o formulário desabilitado. O formulário existe
// para preencher — tem caixa, rótulo em cima de cada campo e espaço para o
// dedo —, e isso desperdiça a página inteira quando o que se quer é ler. Aqui
// os valores vêm em blocos densos, e o que está vazio simplesmente não aparece.
//
// O preço dessa escolha é ter dois lugares que mostram os mesmos campos. O que
// NÃO se duplica é o cálculo: todo número derivado sai das mesmas funções de
// lib/ficha.ts que o formulário usa, então os dois não têm como divergir.
//
// Não é componente de cliente: não há estado nenhum aqui, então ele renderiza
// no servidor e chega ao navegador como HTML puro — o que também é o que faz a
// impressão sair fiel.

import {
  ABREV_ATRIBUTO,
  ATRIBUTOS,
  PERICIAS,
  agarrar,
  ataqueCorpo,
  ataqueDistancia,
  ca,
  caDesprevenido,
  caToque,
  cargasAuto,
  fortitude,
  formatarMod,
  iniciativa,
  modAtributo,
  nivelTotal,
  penalidadeArmadura,
  periciasDeClasse,
  pesoTotalAuto,
  pvMax,
  reflexos,
  tamanhoPor,
  totalPericia,
  vontade,
  type DadosFicha,
} from "@/lib/ficha";
import { classePor } from "@/lib/dnd35/classes";

const vazio = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "");

/** Um par rótulo/valor. Some quando não há valor. */
function Dado({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  if (vazio(valor)) return null;
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted">
        {rotulo}
      </dt>
      <dd className="text-sm font-medium">{valor}</dd>
    </div>
  );
}

/** Caixinha de número grande: CA, PV, iniciativa. */
function Numero({
  rotulo,
  valor,
  nota,
}: {
  rotulo: string;
  valor: React.ReactNode;
  nota?: string;
}) {
  return (
    <div className="rounded-lg border border-border px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-wide text-muted">{rotulo}</p>
      <p className="text-lg font-semibold text-accent print:text-black">
        {valor}
      </p>
      {nota && <p className="text-[11px] text-muted">{nota}</p>}
    </div>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-2 border-b border-border pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Tabela({
  colunas,
  linhas,
}: {
  colunas: string[];
  linhas: React.ReactNode[][];
}) {
  if (linhas.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
            {colunas.map((c) => (
              <th key={c} className="pb-1 pr-3 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className="border-t border-border/60">
              {linha.map((celula, j) => (
                <td key={j} className="py-1 pr-3 align-top">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FichaLeitura({
  nome,
  dados,
}: {
  nome: string;
  dados: DadosFicha;
}) {
  const nivel = nivelTotal(dados);
  const classes = dados.classes
    .filter((c) => c.classe)
    .map((c) => `${classePor(c.classe)?.nome ?? c.classe} ${c.nivel ?? ""}`.trim())
    .join(" / ");

  const deClasse = periciasDeClasse(dados);
  const cargas = cargasAuto(dados);
  const moedas = [
    ["PL", dados.dinheiro.pl],
    ["PO", dados.dinheiro.po],
    ["PP", dados.dinheiro.pp],
    ["PC", dados.dinheiro.pc],
  ].filter(([, v]) => !vazio(v));

  // Perícia sem graduação, sem bônus e que não é de classe não diz nada — só
  // ocuparia página. Some da leitura, e continua na edição.
  const pericias = PERICIAS.filter((p) => {
    const f = dados.pericias[p.id];
    return f && (f.ranks || f.misc || f.classe);
  });

  return (
    <article className="space-y-6 print:space-y-4 print:text-black">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{nome}</h1>
        <p className="text-sm text-muted">
          {[classes || dados.classeNivel, dados.raca, dados.alinhamento]
            .filter((x) => !vazio(x))
            .join(" · ")}
          {nivel > 0 && ` · nível ${nivel}`}
        </p>
      </header>

      <Bloco titulo="Identidade">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          <Dado rotulo="Jogador" valor={dados.jogador} />
          <Dado rotulo="Divindade" valor={dados.divindade} />
          <Dado rotulo="Tamanho" valor={tamanhoPor(dados.tamanho).nome} />
          <Dado rotulo="Deslocamento" valor={dados.deslocamento} />
          <Dado rotulo="Idade" valor={dados.idade} />
          <Dado rotulo="Sexo" valor={dados.sexo} />
          <Dado rotulo="Altura" valor={dados.altura} />
          <Dado rotulo="Peso" valor={dados.peso} />
          <Dado rotulo="Olhos" valor={dados.olhos} />
          <Dado rotulo="Cabelo" valor={dados.cabelo} />
          <Dado rotulo="Pele" valor={dados.pele} />
          <Dado
            rotulo="XP"
            valor={
              vazio(dados.xpAtual)
                ? null
                : `${dados.xpAtual}${dados.xpProximo ? ` / ${dados.xpProximo}` : ""}`
            }
          />
          <Dado rotulo="Idiomas" valor={dados.idiomas} />
        </dl>
      </Bloco>

      <Bloco titulo="Atributos">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ATRIBUTOS.map((a) => {
            const temp = dados.atributosTemp[a.chave];
            return (
              <Numero
                key={a.chave}
                rotulo={ABREV_ATRIBUTO[a.chave]}
                valor={`${dados.atributos[a.chave] ?? "—"} (${formatarMod(modAtributo(dados, a.chave))})`}
                nota={vazio(temp) ? undefined : `temp. ${temp}`}
              />
            );
          })}
        </div>
      </Bloco>

      <Bloco titulo="Combate">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Numero
            rotulo="PV"
            valor={`${dados.pvAtual ?? "—"} / ${pvMax(dados)}`}
            nota={
              vazio(dados.danoNaoLetal)
                ? undefined
                : `não-letal ${dados.danoNaoLetal}`
            }
          />
          <Numero rotulo="CA" valor={ca(dados)} />
          <Numero rotulo="Toque" valor={caToque(dados)} />
          <Numero rotulo="Desprev." valor={caDesprevenido(dados)} />
          <Numero rotulo="Iniciativa" valor={formatarMod(iniciativa(dados))} />
          <Numero rotulo="BBA" valor={dados.bba || "—"} />
          <Numero rotulo="Fortitude" valor={formatarMod(fortitude(dados))} />
          <Numero rotulo="Reflexos" valor={formatarMod(reflexos(dados))} />
          <Numero rotulo="Vontade" valor={formatarMod(vontade(dados))} />
          <Numero rotulo="Corpo-a-corpo" valor={formatarMod(ataqueCorpo(dados))} />
          <Numero rotulo="À distância" valor={formatarMod(ataqueDistancia(dados))} />
          <Numero rotulo="Agarrar" valor={formatarMod(agarrar(dados))} />
        </div>
        {!vazio(dados.reducaoDano) && (
          <p className="mt-2 text-sm">
            <span className="text-muted">Redução de dano:</span>{" "}
            {dados.reducaoDano}
          </p>
        )}
      </Bloco>

      {dados.armas.length > 0 && (
        <Bloco titulo="Armas">
          <Tabela
            colunas={["Arma", "Bônus", "Dano", "Crítico", "Alcance", "Tipo", "Notas"]}
            linhas={dados.armas.map((a) => [
              a.nome,
              a.bonus || formatarMod(ataqueCorpo(dados)),
              a.dano,
              a.critico,
              a.alcance,
              a.tipo,
              [a.municao, a.notas].filter((x) => !vazio(x)).join(" · "),
            ])}
          />
        </Bloco>
      )}

      {dados.armaduras.length > 0 && (
        <Bloco titulo="Armaduras e escudos">
          <Tabela
            colunas={["Peça", "Tipo", "CA", "Des máx", "Penal.", "Falha", "Peso"]}
            linhas={dados.armaduras.map((a) => [
              a.nome,
              a.tipo,
              vazio(a.bonusCa) ? "" : formatarMod(a.bonusCa!),
              a.desMax ?? "",
              a.penalidade ?? "",
              vazio(a.falhaMagia) ? "" : `${a.falhaMagia}%`,
              vazio(a.peso) ? "" : `${a.peso} kg`,
            ])}
          />
          <p className="mt-2 text-sm text-muted">
            Penalidade total: {penalidadeArmadura(dados)}
          </p>
        </Bloco>
      )}

      {pericias.length > 0 && (
        <Bloco titulo="Perícias">
          <Tabela
            colunas={["Perícia", "Atributo", "Grad.", "Diversos", "Total"]}
            linhas={pericias.map((p) => {
              const f = dados.pericias[p.id];
              return [
                <span key="n">
                  {p.nome}
                  {deClasse.has(p.id) && (
                    <span className="ml-1 text-[11px] text-muted">(classe)</span>
                  )}
                </span>,
                ABREV_ATRIBUTO[p.atributo],
                f.ranks ?? 0,
                f.misc ?? 0,
                formatarMod(totalPericia(p, f, dados)),
              ];
            })}
          />
        </Bloco>
      )}

      {dados.talentos.length > 0 && (
        <Bloco titulo="Talentos">
          <ul className="space-y-1 text-sm">
            {dados.talentos.map((t, i) => (
              <li key={i}>
                <span className="font-medium">{t.nome}</span>
                {!vazio(t.notas) && (
                  <span className="text-muted"> — {t.notas}</span>
                )}
              </li>
            ))}
          </ul>
        </Bloco>
      )}

      {dados.habilidades.length > 0 && (
        <Bloco titulo="Habilidades especiais">
          <ul className="space-y-1 text-sm">
            {dados.habilidades.map((h, i) => (
              <li key={i}>
                <span className="font-medium">{h.nome}</span>
                {!vazio(h.notas) && (
                  <span className="text-muted"> — {h.notas}</span>
                )}
              </li>
            ))}
          </ul>
        </Bloco>
      )}

      {(dados.equipamento.length > 0 || moedas.length > 0) && (
        <Bloco titulo="Equipamento">
          <Tabela
            colunas={["Item", "Qtd.", "Peso", "Notas"]}
            linhas={dados.equipamento.map((i) => [
              i.nome,
              i.qtd ?? "",
              vazio(i.peso) ? "" : `${i.peso} kg`,
              i.notas,
            ])}
          />
          <p className="mt-2 text-sm text-muted">
            {moedas.length > 0 && (
              <>Moedas: {moedas.map(([s, v]) => `${v} ${s}`).join(", ")}. </>
            )}
            Peso total: {pesoTotalAuto(dados).toFixed(1)} kg · cargas{" "}
            {cargas.leve}/{cargas.media}/{cargas.pesada} kg
          </p>
        </Bloco>
      )}

      {dados.magias.length > 0 && (
        <Bloco titulo="Magias">
          {(dados.conjuracaoClasse || dados.conjuracaoAtributo) && (
            <p className="mb-2 text-sm text-muted">
              {[dados.conjuracaoClasse, dados.conjuracaoAtributo]
                .filter((x) => !vazio(x))
                .join(" · ")}
            </p>
          )}
          <Tabela
            colunas={["Magia", "Nível", "Escola", "Preparadas", "Notas"]}
            linhas={dados.magias.map((m) => [
              m.nome,
              m.nivel,
              m.escola,
              m.preparadas,
              m.notas,
            ])}
          />
        </Bloco>
      )}
    </article>
  );
}
