// Confere que as tabelas de lib/dnd35 são consistentes entre si.
//
// Uso:  npm run tabelas:conferir
//
// Existe porque as tabelas se citam por nome escrito à mão: o pré-requisito de
// um talento nomeia outro talento, e os talentos de estilo nomeiam armas. Nome
// escrito à mão não é verificado por tipo — quando um deles muda, o outro fica
// apontando para o vazio em silêncio, e só aparece como autocomplete que não
// completa. Foi assim que se descobriu que o bloco do núcleo dos talentos não
// vinha do Livro do Jogador, e depois que a tabela de armas também não vinha.
//
// Sai com código 1 se algo não resolver, então serve em CI.

import { TALENTOS } from "../lib/dnd35/talentos.ts";
import { ARMAS, ARMADURAS } from "../lib/dnd35/equipamento.ts";
import { DOMINIOS } from "../lib/dnd35/dominios.ts";
import { RACAS } from "../lib/dnd35/racas.ts";
import {
  DIVINDADES,
  DIVINDADES_POR_TRANSCREVER,
} from "../lib/dnd35/divindades.ts";
import { ALINHAMENTOS } from "../lib/ficha.ts";

const problemas = [];
const anota = (grupo, o_que, onde) => problemas.push({ grupo, o_que, onde });

// Um pré-requisito é uma lista separada por vírgula, MAS a lista de armas
// dentro dos parênteses também usa vírgula: "Foco em Arma (espada bastarda,
// espada longa)" é um item só. Dividir sem olhar os parênteses transforma cada
// arma num falso pré-requisito.
function itensDoPreRequisito(texto) {
  const itens = [];
  let atual = "";
  let profundidade = 0;
  for (const c of texto) {
    if (c === "(") profundidade++;
    else if (c === ")") profundidade--;
    if (c === "," && profundidade === 0) {
      itens.push(atual.trim());
      atual = "";
    } else atual += c;
  }
  if (atual.trim()) itens.push(atual.trim());
  return itens;
}

// Nome de tabela é escrito com inicial maiúscula; pré-requisito é prosa, e no
// meio da frase a mesma coisa aparece em caixa baixa ("alabarda", "bônus base
// de ataque"). Comparar sem caixa e sem acento evita falso positivo de grafia.
const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/** Índice nome-ou-apelido -> linha, comparando sem caixa e sem acento. */
function indexar(lista) {
  const mapa = new Map();
  for (const x of lista)
    for (const chave of [x.nome, ...(x.apelidos ?? [])])
      mapa.set(norm(chave), x);
  return mapa;
}
const TALENTO_POR = indexar(TALENTOS);
const ARMA_POR = indexar(ARMAS);

// O que num pré-requisito NÃO é nome de talento.
const NAO_E_TALENTO = [
  /^(for|des|con|int|sab|car) \d+$/, // "For 13"
  /^bonus base de ataque/,
  /^\d+º nivel/,
  /^habilidade /, // "Habilidade de expulsar", "habilidade Forma Selvagem"
  /niveis? de/,
  /^capaz de/,
  /^usar a arma/, // prosa para "a proficiência da arma escolhida"
  /graduac(ao|oes)/,
  /^qualquer/,
];

// --- 1. Todo pré-requisito que cita talento resolve em TALENTOS?
for (const t of TALENTOS) {
  if (!t.preRequisito) continue;
  for (const item of itensDoPreRequisito(t.preRequisito)) {
    // "Foco em Arma (alabarda)" -> o talento é "Foco em Arma".
    const semParenteses = item.replace(/\s*\([^)]*\)\s*/g, "").trim();
    if (!semParenteses) continue;
    const chave = norm(semParenteses);
    if (NAO_E_TALENTO.some((re) => re.test(chave))) continue;
    if (TALENTO_POR.has(chave)) continue;
    // "Foco em Arma na arma" e "Foco em Magia na escola" citam o talento pelo
    // que ele se aplica; o nome é o que vem antes.
    if (TALENTO_POR.has(chave.replace(/\s+n[ao]\s+\S+$/, ""))) continue;
    anota("talento", `"${semParenteses}"`, t.nome);
  }
}

// --- 2. Toda arma citada num pré-requisito resolve em ARMAS?
for (const t of TALENTOS) {
  if (!t.preRequisito) continue;
  for (const m of t.preRequisito.matchAll(
    /(?:Foco em Arma|Especialização em Arma|Usar Arma Exótica|Usar Arma Simples|Acuidade com Arma)\s*\(([^)]+)\)/g,
  )) {
    for (const bruto of m[1].split(/,| ou /)) {
      const arma = bruto.trim();
      if (!arma) continue;
      const chave = norm(arma);
      if (ARMA_POR.has(chave)) continue;
      // O livro às vezes põe entre parênteses a família, não a arma: Rapidez
      // de Recarga exige "Usar Arma Simples (besta)", valendo para a leve e a
      // pesada. Vale se for prefixo de alguma arma de verdade.
      if ([...ARMA_POR.keys()].some((n) => n.startsWith(chave + " "))) continue;
      anota("arma", `"${arma}"`, t.nome);
    }
  }
}

// --- 2b. Divindades: domínio, arma predileta e tendência resolvem?
//
// E, principalmente, o cruzamento nos dois sentidos com dominios.ts. As duas
// listas vêm de tabelas diferentes do livro (3-7 e o capítulo de domínios), o
// que faz uma conferir a outra: se um deus ganha um domínio de um lado e não
// do outro, foi engano de transcrição, não do livro.
const DOMINIO_POR = new Set(DOMINIOS.map((d) => norm(d.nome)));
const porTranscrever = new Set(DIVINDADES_POR_TRANSCREVER.map(norm));

for (const d of DIVINDADES) {
  if (!ALINHAMENTOS.some((a) => a === d.tendencia))
    anota("tendência", `"${d.tendencia}"`, d.nome);
  for (const dom of d.dominios)
    if (!DOMINIO_POR.has(norm(dom))) anota("domínio", `"${dom}"`, d.nome);
  for (const arma of d.armaPredileta.split(" ou "))
    if (!ARMA_POR.has(norm(arma.trim())))
      anota("arma predileta", `"${arma.trim()}"`, d.nome);
}

// dominios.ts -> divindades.ts
for (const dom of DOMINIOS)
  for (const deus of dom.deuses) {
    if (porTranscrever.has(norm(deus))) continue;
    const d = DIVINDADES.find((x) => norm(x.nome) === norm(deus));
    if (!d) anota("divindade", `"${deus}"`, `domínio ${dom.nome}`);
    else if (!d.dominios.some((x) => norm(x) === norm(dom.nome)))
      anota(
        "cruzamento",
        `domínio ${dom.nome} lista ${deus}, mas ${deus} não lista ${dom.nome}`,
        "dominios.ts",
      );
  }

// divindades.ts -> dominios.ts
for (const d of DIVINDADES)
  for (const nomeDom of d.dominios) {
    const dom = DOMINIOS.find((x) => norm(x.nome) === norm(nomeDom));
    if (dom && !dom.deuses.some((x) => norm(x) === norm(d.nome)))
      anota(
        "cruzamento",
        `${d.nome} lista o domínio ${nomeDom}, mas ${nomeDom} não lista ${d.nome}`,
        "divindades.ts",
      );
  }

// --- 2c. Toda raça do núcleo tem físico, e os dados dele são legíveis?
//
// O físico alimenta a sugestão de idade, altura e peso na ficha. Raça sem ele
// simplesmente não sugere nada — falha silenciosa, que é o que este script
// existe para impedir.
const DADO = /^\d+d(\d+|%)$/;
for (const r of RACAS) {
  const f = r.fisico;
  if (!f) {
    anota("físico", "raça sem idade, altura e peso", r.nome);
    continue;
  }
  const expressoes = [
    f.idadeExtra.rapido,
    f.idadeExtra.medio,
    f.idadeExtra.lento,
    f.idadeMaxima,
    f.masculino.alturaDados,
    f.feminino.alturaDados,
    f.masculino.pesoDados,
    f.feminino.pesoDados,
  ].filter((x) => x != null);
  for (const e of expressoes)
    if (!DADO.test(e)) anota("dado", `"${e}" não é uma rolagem`, r.nome);
  if (!(f.idadeAdulta < f.maturidade && f.maturidade < f.velho && f.velho < f.veneravel))
    anota("físico", "as idades não estão em ordem crescente", r.nome);
}

// --- 3. Nenhum apelido pode ser o nome de outra linha da mesma tabela.
//
// Esta é a armadilha que já mordeu duas vezes: "Mãos Leves" era o Dedos
// Lépidos do livro, e Mãos Leves de verdade é outro talento. Apelidar ali
// mandaria a busca para a coisa errada — pior que não achar, porque não avisa.
for (const [rotulo, lista] of [
  ["talento", TALENTOS],
  ["arma", ARMAS],
  ["armadura", ARMADURAS],
]) {
  const nomes = new Map(lista.map((x) => [x.nome, x]));
  for (const x of lista)
    for (const apelido of x.apelidos ?? [])
      if (nomes.has(apelido) && nomes.get(apelido) !== x)
        anota(
          "apelido",
          `"${apelido}" é apelido de "${x.nome}", mas também é o nome de outra linha`,
          rotulo,
        );
}

// --- 4. Nome repetido na mesma tabela (o catálogo é indexado por nome).
for (const [rotulo, lista] of [
  ["talento", TALENTOS],
  ["arma", ARMAS],
  ["armadura", ARMADURAS],
]) {
  const vistos = new Set();
  for (const x of lista) {
    if (vistos.has(x.nome)) anota("duplicata", `"${x.nome}"`, rotulo);
    vistos.add(x.nome);
  }
}

console.log(
  `${TALENTOS.length} talentos, ${ARMAS.length} armas, ${ARMADURAS.length} armaduras, ` +
    `${DIVINDADES.length} divindades, ${RACAS.length} raças.`,
);

if (problemas.length === 0) {
  console.log("Tudo que uma tabela cita da outra resolve.");
  process.exit(0);
}

console.log(`\n${problemas.length} problemas:\n`);
for (const p of problemas)
  console.log(`  [${p.grupo}] ${p.o_que}  — em ${p.onde}`);
process.exitCode = 1;
