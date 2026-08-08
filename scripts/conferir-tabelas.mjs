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
  `${TALENTOS.length} talentos, ${ARMAS.length} armas, ${ARMADURAS.length} armaduras.`,
);

if (problemas.length === 0) {
  console.log("Tudo que uma tabela cita da outra resolve.");
  process.exit(0);
}

console.log(`\n${problemas.length} problemas:\n`);
for (const p of problemas)
  console.log(`  [${p.grupo}] ${p.o_que}  — em ${p.onde}`);
process.exitCode = 1;
