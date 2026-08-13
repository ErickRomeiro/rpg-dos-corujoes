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
  estiloRecorte,
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
import {
  CORES_CABELO,
  CORES_OLHOS,
  CORES_PELE,
  corPorNome,
  type OpcaoCor,
} from "@/lib/dnd35/aparencia";
import { CartaFicha } from "@/app/dnd35/fichas/_components/carta-ficha";
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

/**
 * Cor de aparência com a amostra ao lado do nome.
 *
 * O nome vem sempre, e a amostra só quando o valor está na lista — ficha antiga
 * com texto livre mostra o texto sozinho. Impressora costuma não imprimir cor
 * de fundo, e é por isso que a amostra acompanha o nome em vez de substituí-lo:
 * no papel a informação continua inteira.
 */
function Cor({
  rotulo,
  valor,
  opcoes,
}: {
  rotulo: string;
  valor: string;
  opcoes: readonly OpcaoCor[];
}) {
  if (vazio(valor)) return null;
  const achada = corPorNome(opcoes, valor);

  return (
    <Dado
      rotulo={rotulo}
      valor={
        <span className="flex items-center gap-1.5">
          {achada?.hex && (
            <span
              aria-hidden
              className="h-3 w-3 flex-none rounded-sm border border-black/40"
              style={{ backgroundColor: achada.hex }}
            />
          )}
          {valor}
        </span>
      }
    />
  );
}

/**
 * Caixinha de número grande: CA, PV, iniciativa.
 *
 * `h-full` com coluna flex e o valor empurrado para a base (`mt-auto`) é o que
 * mantém os números numa mesma linha visual. Sem isso, um rótulo que quebra em
 * duas linhas — "Corpo-a-corpo" é o caso — estica a linha inteira do grid e
 * desce só o número daquela célula, desalinhando a fileira.
 */
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
    <div className="flex h-full flex-col rounded-lg border border-border px-3 py-2 text-center">
      <p className="text-[11px] uppercase leading-tight tracking-wide text-muted">
        {rotulo}
      </p>
      <p className="mt-auto text-lg font-semibold text-accent print:text-black">
        {valor}
      </p>
      {nota && <p className="text-[11px] text-muted">{nota}</p>}
    </div>
  );
}

/**
 * Grade das caixinhas. `auto-rows-fr` iguala a altura de todas as fileiras, e
 * não só das células de uma mesma fileira — é o par necessário do `h-full`
 * acima para a grade inteira ficar regular.
 */
function GradeNumeros({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid auto-rows-fr grid-cols-3 gap-2 sm:grid-cols-6">
      {children}
    </div>
  );
}

/**
 * Atributo no formato das fichas oficiais: a abreviatura em cima, o valor
 * grande no meio e o modificador num medalhão que morde a borda de baixo.
 *
 * É a peça mais reconhecível de uma ficha de D&D, e a razão de ela existir é
 * prática, não decorativa: em jogo se lê o MODIFICADOR o tempo todo e o valor
 * quase nunca, então ele ganha o destaque de forma própria em vez de ficar
 * entre parênteses ao lado, como estava.
 */
function Atributo({
  rotulo,
  valor,
  modificador,
  temp,
}: {
  rotulo: string;
  valor: number | null;
  modificador: string;
  temp?: string;
}) {
  return (
    <div className="relative rounded-lg border border-ouro/25 bg-surface-2/40 px-2 pb-5 pt-2 text-center print:border-black/40">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-ouro-fosco print:text-black">
        {rotulo}
      </p>
      <p className="text-2xl font-bold leading-tight tabular-nums">
        {valor ?? "—"}
      </p>
      {temp && (
        <p className="text-[10px] leading-none text-muted">temp. {temp}</p>
      )}
      {/* O medalhão fica METADE para fora da caixa, encostado na borda de
          baixo — é assim na ficha impressa, e é o que o faz parecer aplicado
          sobre a peça em vez de mais uma linha de texto dentro dela. */}
      <span className="absolute -bottom-3 left-1/2 flex h-7 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-ouro/40 bg-background text-sm font-bold tabular-nums text-accent print:border-black print:text-black">
        {modificador}
      </span>
    </div>
  );
}

/**
 * Lista de nome + observação, em duas colunas quando há largura.
 *
 * Talentos e habilidades são linhas curtas: numa coluna só, sobra metade da
 * folha em branco e a lista desce mais do que precisa. `columns-2` é a
 * ferramenta certa aqui, e não um grid, porque preenche a primeira coluna e
 * transborda para a segunda — mantendo a ordem de leitura de cima para baixo.
 * `break-inside-avoid` impede um item de ser cortado ao meio na virada.
 */
function ListaDupla({ itens }: { itens: { nome: string; notas: string }[] }) {
  return (
    <ul className="text-sm sm:columns-2 sm:gap-6">
      {itens.map((item, i) => (
        <li key={i} className="mb-1 break-inside-avoid">
          <span className="font-medium">{item.nome}</span>
          {!vazio(item.notas) && (
            <span className="text-muted"> — {item.notas}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Bloco da ficha, no tratamento do livro.
 *
 * O Livro do Jogador separa seções com um título em versalete e uma REGRA
 * abaixo dele, correndo a largura toda — não com caixas empilhadas. Manter a
 * regra (e não uma borda de caixa) é o que dá o ar de página de livro sem
 * gastar espaço com moldura em volta de cada coisa.
 *
 * A regra é dourada e desbota para a direita: no livro ela é um filete impresso
 * que some na margem, e o degradê é como isso se traduz em tela sem virar uma
 * linha dura de ponta a ponta.
 */
function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-0.5 font-semibold uppercase tracking-[0.18em] text-[13px] text-ouro print:text-black">
        {titulo}
      </h2>
      <div
        aria-hidden
        className="mb-2.5 h-px bg-gradient-to-r from-ouro/70 via-ouro/25 to-transparent print:bg-black"
      />
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
      <table className="w-full border-collapse text-sm">
        <thead>
          {/* Cabeçalho em versalete sobre filete dourado, como as tabelas do
              livro ("Tabela 3-1: Bônus Base de Resistência…"). */}
          <tr className="border-b border-ouro/40 text-left text-[11px] uppercase tracking-wider text-ouro-fosco print:text-black">
            {colunas.map((c) => (
              <th key={c} className="px-2 pb-1 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        {/* Zebra em vez de linhas divisórias: é o traço mais reconhecível das
            tabelas do 3.5, onde uma faixa tan alterna com o pergaminho e não há
            borda vertical nenhuma. Aqui a faixa é um véu claro sobre o fundo
            escuro, cumprindo o mesmo papel de guiar o olho pela linha. */}
        <tbody className="[&>tr:nth-child(odd)]:bg-foreground/[0.04]">
          {linhas.map((linha, i) => (
            <tr key={i} className="print:border-b print:border-black/20">
              {linha.map((celula, j) => (
                <td key={j} className="px-2 py-1 align-top">
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
  editarHref,
}: {
  nome: string;
  dados: DadosFicha;
  /**
   * Para onde mandar quem quiser completar a ficha. Ausente no link público,
   * onde quem lê não é dono de nada — lá o aviso do que falta não aparece,
   * porque seria cobrança de uma tarefa que o leitor não pode cumprir.
   */
  editarHref?: string;
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

  // Blocos inteiros somem quando não têm conteúdo, o que deixa a leitura curta
  // e muda sem avisar. Numa ficha em construção isso vira dúvida — "não tenho
  // talentos ou esqueci de preencher?". Listar as ausências pelo nome responde
  // essa pergunta sem ressuscitar tabelas vazias.
  const emBranco = [
    dados.armas.length === 0 && "armas",
    dados.armaduras.length === 0 && "armaduras",
    pericias.length === 0 && "perícias",
    dados.talentos.length === 0 && "talentos",
    dados.habilidades.length === 0 && "habilidades especiais",
    dados.equipamento.length === 0 && moedas.length === 0 && "equipamento",
    dados.magias.length === 0 && "magias",
  ].filter((x): x is string => typeof x === "string");

  return (
    <article className="print:text-black">
      {/* Carta ao lado das tabelas, e não acima delas: empilhada, ela empurrava
          a ficha inteira para baixo da dobra. Só a partir de `lg` — abaixo
          disso não há largura para duas colunas e ela volta a abrir a página.

          `lg:sticky` mantém a carta à vista enquanto se rola perícias e magias,
          que é a parte longa da folha.

          `print:block` desfaz a coluna no papel: a impressão volta a ser uma
          coisa só, sem a carta (que é `print:hidden`). */}
      <div className="lg:flex lg:items-start lg:gap-6 print:block">
        <div className="mb-6 print:hidden lg:mb-0 lg:sticky lg:top-20 lg:w-80 lg:flex-none">
          <CartaFicha nome={nome} dados={dados} />
        </div>

        <div className="min-w-0 flex-1 space-y-6 print:space-y-4">
          {/* Faixa do nome: nos modelos o nome do personagem vem numa placa
              destacada, com os dados de identidade em campos menores ao lado —
              é o que anuncia de quem é a folha antes de qualquer número.

              Duas camadas: a de fora é o filete dourado, a de dentro é o couro
              recuado 1px. É assim, e não com `border`, porque o chanfro é feito
              com `clip-path`, que recortaria a borda junto (ver `.placa`). */}
          <header className="placa bg-ouro/40 p-px print:bg-transparent">
            <div className="placa flex items-start gap-4 bg-gradient-to-br from-[var(--couro-claro)] via-[var(--couro)] to-[var(--couro)] p-3 print:bg-transparent">
              {!vazio(dados.retrato) && (
                // A miniatura tem recorte próprio, separado do da carta: num
                // quadrado de 80px o corpo inteiro não identifica ninguém, e o
                // enquadramento que serve aqui costuma fechar no rosto.
                //
                // O corte mora na moldura, e não no <img>: a ampliação do
                // recorte é um `scale`, que faz a imagem crescer para fora do
                // quadrado e passar por cima do nome ao lado.
                <div className="h-20 w-20 flex-none overflow-hidden rounded-lg border border-border print:border-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dados.retrato}
                    alt={`Retrato de ${nome}`}
                    className="h-full w-full object-cover"
                    style={estiloRecorte(dados.retratoMini)}
                  />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight">{nome}</h1>
                <p className="text-sm text-foreground/70">
                  {[classes || dados.classeNivel, dados.raca, dados.alinhamento]
                    .filter((x) => !vazio(x))
                    .join(" · ")}
                  {nivel > 0 && ` · nível ${nivel}`}
                </p>
              </div>
            </div>
          </header>

          {/* Atributos e combate vêm antes da identidade: é o que se consulta com o
              dado na mão. Cor dos olhos e idade importam para interpretar, não para
              resolver um turno, e por isso desceram. */}
          <Bloco titulo="Atributos">
            {/* `pb-4` no fim da grade abre espaço para o medalhão do último,
                que avança para fora da caixa. */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-6 pb-4 sm:grid-cols-6">
              {ATRIBUTOS.map((a) => {
                const temp = dados.atributosTemp[a.chave];
                return (
                  <Atributo
                    key={a.chave}
                    rotulo={ABREV_ATRIBUTO[a.chave]}
                    valor={dados.atributos[a.chave]}
                    modificador={formatarMod(modAtributo(dados, a.chave))}
                    temp={vazio(temp) ? undefined : String(temp)}
                  />
                );
              })}
            </div>
          </Bloco>

          <Bloco titulo="Combate">
            <GradeNumeros>
              <Numero
                rotulo="PV"
                // Ficha que nunca registrou PV atual está inteira — é a mesma
                // suposição que o painel do mestre faz ao aplicar o primeiro dano.
                // Mostrar "—" aqui daria a entender que o valor se perdeu.
                valor={`${dados.pvAtual ?? pvMax(dados)} / ${pvMax(dados)}`}
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
            </GradeNumeros>
            {!vazio(dados.reducaoDano) && (
              <p className="mt-2 text-sm">
                <span className="text-muted">Redução de dano:</span>{" "}
                {dados.reducaoDano}
              </p>
            )}
          </Bloco>

          <Bloco titulo="Identidade">
            {/* `auto-fill` em vez de número fixo de colunas: os campos vazios não
                renderizam, e uma grade de 4 colunas fixas transformava cada ausência
                num buraco. Assim os que existem se acomodam lado a lado. */}
            <dl className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-x-4 gap-y-2">
              <Dado rotulo="Jogador" valor={dados.jogador} />
              <Dado rotulo="Divindade" valor={dados.divindade} />
              <Dado rotulo="Tamanho" valor={tamanhoPor(dados.tamanho).nome} />
              <Dado rotulo="Deslocamento" valor={dados.deslocamento} />
              <Dado rotulo="Idade" valor={dados.idade} />
              <Dado rotulo="Sexo" valor={dados.sexo} />
              <Dado rotulo="Altura" valor={dados.altura} />
              <Dado rotulo="Peso" valor={dados.peso} />
              <Cor rotulo="Olhos" valor={dados.olhos} opcoes={CORES_OLHOS} />
              <Cor rotulo="Cabelo" valor={dados.cabelo} opcoes={CORES_CABELO} />
              <Cor rotulo="Pele" valor={dados.pele} opcoes={CORES_PELE} />
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
              <ListaDupla itens={dados.talentos} />
            </Bloco>
          )}

          {dados.habilidades.length > 0 && (
            <Bloco titulo="Habilidades especiais">
              <ListaDupla itens={dados.habilidades} />
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

          {editarHref && emBranco.length > 0 && (
            // Discreto de propósito: é uma nota de rodapé sobre o estado da ficha,
            // não um erro. Fica fora da impressão, que é a ficha como ela está.
            <p className="border-t border-border pt-3 text-sm text-muted print:hidden">
              Ainda em branco: {emBranco.join(", ")}.{" "}
              <a
                href={editarHref}
                className="font-medium text-accent underline underline-offset-4"
              >
                Preencher
              </a>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
