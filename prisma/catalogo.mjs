// O que o catálogo oficial contém, montado a partir das tabelas de lib/dnd35.
//
// Mora aqui, e não dentro do seed, porque dois scripts precisam da MESMA
// resposta: o seed, que escreve, e o scripts/limpar-catalogo.mjs, que apaga o
// que sobrou. Se a limpeza tivesse a própria cópia desta função e alguém
// acrescentasse uma tabela só no seed, a limpeza apagaria as linhas novas por
// não conhecê-las. Uma fonte só evita isso.

import { readFileSync } from "node:fs";

export const SISTEMA = "dnd35";
export const FONTE = "SRD 3.5";

/** Lê .env.local para os scripts que rodam fora do Next. */
export function carregarEnv(arquivo = ".env.local") {
  for (const linha of readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    const m = linha.match(/^([A-Z_0-9]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^"|"$/g, "");
  }
}

// Os arquivos de dados são TypeScript só por causa dos tipos; o conteúdo é
// JSON puro. Lemos com o strip-types do Node para não duplicar as tabelas.
const { RACAS } = await import("../lib/dnd35/racas.ts");
const { CLASSES } = await import("../lib/dnd35/classes.ts");
const { ARMAS, ARMADURAS, ITENS_COMUNS } = await import("../lib/dnd35/equipamento.ts");
const { TALENTOS } = await import("../lib/dnd35/talentos.ts");
const { MAGIAS, ELEMENTOS_WU_JEN } = await import("../lib/dnd35/magias.ts");
const { DOMINIOS } = await import("../lib/dnd35/dominios.ts");

/**
 * Monta as linhas do catálogo a partir das tabelas.
 *
 * A `fonte` de cada linha é o SRD, exceto onde a tabela declara o livro de
 * onde veio — nem tudo no catálogo é conteúdo aberto, e rotular um livro
 * fechado como SRD seria falso.
 */
export function montarLinhas() {
  const linhas = [];
  const add = (tipo, nome, dados, fonte = FONTE) =>
    linhas.push({ tipo, nome, dados, fonte });

  for (const r of RACAS) add("RACA", r.nome, r);
  for (const c of CLASSES) add("CLASSE", c.nome, c, c.livro ?? FONTE);
  for (const a of ARMAS) add("ARMA", a.nome, a);
  for (const a of ARMADURAS) add("ARMADURA", a.nome, a);
  for (const t of TALENTOS) add("TALENTO", t.nome, t, t.livro ?? FONTE);
  // O elemento do Wu Jen mora fora de `Magia` (ver magias.ts), mas a linha do
  // banco é uma cópia para consulta: sem ele o app não teria como mostrar.
  for (const m of MAGIAS) {
    const elemento = ELEMENTOS_WU_JEN[m.id];
    add("MAGIA", m.nome, elemento ? { ...m, elementoWuJen: elemento } : m, m.livro ?? FONTE);
  }
  for (const d of DOMINIOS) add("DOMINIO", d.nome, d, d.livro ?? FONTE);
  for (const i of ITENS_COMUNS) add("ITEM", i.nome, i);

  return linhas;
}

/**
 * Nome antigo -> nome de hoje, por tipo, a partir dos `apelidos` das tabelas.
 *
 * A linha antiga no banco continua sendo lixo e vai embora: quem substitui é a
 * linha com o nome novo. Isto serve para a limpeza dizer *por que* cada linha
 * sobrou — "renomeado para X" é uma coisa, "não existe mais" é outra, e quem
 * aprova a remoção precisa ver a diferença.
 */
export function renomeadosPorTipo() {
  const mapa = { TALENTO: new Map(), ARMA: new Map(), ARMADURA: new Map() };
  const juntar = (tipo, lista) => {
    for (const x of lista)
      for (const a of x.apelidos ?? []) mapa[tipo].set(a, x.nome);
  };
  juntar("TALENTO", TALENTOS);
  juntar("ARMA", ARMAS);
  juntar("ARMADURA", ARMADURAS);
  return mapa;
}
