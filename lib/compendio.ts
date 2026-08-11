// Os tipos do catálogo como o Compêndio os apresenta.
//
// O catálogo já existe no banco e alimenta o formulário da ficha; aqui ele
// ganha uma porta de leitura. É a mesma fonte — nada é recontado nem
// reescrito, para consulta e preenchimento não terem como divergir.
//
// Só conteúdo OFICIAL entra por enquanto: `listarCatalogo` sem `mesaId`
// devolve apenas as linhas com mesaId nulo. Homebrew é por mesa, e o Compêndio
// não está dentro de nenhuma — mostrar o de uma mesa aqui exigiria antes
// checar que quem lê é membro dela, senão vaza conteúdo de mesa alheia.

import { prisma } from "@/lib/prisma";
import type { TipoCatalogo } from "@/lib/generated/prisma/enums";

const SISTEMA = "dnd35";

export type SecaoCompendio = {
  /** Pedaço da URL: /dnd35/compendio/<slug>. */
  slug: string;
  tipo: TipoCatalogo;
  /** Título da seção, no plural. */
  rotulo: string;
  /** Como chamar uma linha só, para textos de contagem. */
  singular: string;
  /**
   * Plural para a contagem, quando o rótulo não serve. "Equipamento" nomeia
   * bem a seção mas não conta nada: "31 equipamento" está errado, "31 itens"
   * não. Ausente = o rótulo em minúsculas já é o plural.
   */
  plural?: string;
  icone: string;
  descricao: string;
};

/** A ordem aqui é a ordem na tela — do mais consultado em jogo ao menos. */
export const SECOES: SecaoCompendio[] = [
  {
    slug: "magias",
    tipo: "MAGIA",
    rotulo: "Magias",
    singular: "magia",
    icone: "✨",
    descricao: "Escola, nível por classe e o resumo de cada magia.",
  },
  {
    slug: "talentos",
    tipo: "TALENTO",
    rotulo: "Talentos",
    singular: "talento",
    icone: "🎯",
    descricao: "Pré-requisito e benefício, como o livro descreve.",
  },
  {
    slug: "armas",
    tipo: "ARMA",
    rotulo: "Armas",
    singular: "arma",
    icone: "⚔️",
    descricao: "Dano, crítico, alcance e peso da tabela de armas.",
  },
  {
    slug: "armaduras",
    tipo: "ARMADURA",
    rotulo: "Armaduras e escudos",
    singular: "peça",
    icone: "🛡️",
    descricao: "Bônus na CA, Destreza máxima, penalidade e falha de magia.",
  },
  {
    slug: "classes",
    tipo: "CLASSE",
    rotulo: "Classes",
    singular: "classe",
    icone: "🗡️",
    descricao: "Dado de vida, BBA, resistências boas e perícias de classe.",
  },
  {
    slug: "racas",
    tipo: "RACA",
    rotulo: "Raças",
    singular: "raça",
    icone: "🧝",
    descricao: "Ajustes de atributo, deslocamento, idiomas e traços.",
  },
  {
    slug: "dominios",
    tipo: "DOMINIO",
    rotulo: "Domínios",
    singular: "domínio",
    icone: "🕯️",
    descricao: "Poder concedido e as nove magias, do 1º ao 9º nível.",
  },
  {
    slug: "divindades",
    tipo: "DIVINDADE",
    rotulo: "Divindades",
    singular: "divindade",
    icone: "⛪",
    descricao: "Tendência, domínios, arma predileta e adoradores.",
  },
  {
    slug: "itens",
    tipo: "ITEM",
    rotulo: "Equipamento",
    singular: "item",
    plural: "itens",
    icone: "🎒",
    descricao: "Itens de aventura, com o peso que entra na carga.",
  },
];

export function secaoPorSlug(slug: string): SecaoCompendio | undefined {
  return SECOES.find((s) => s.slug === slug);
}

/**
 * Quantas linhas oficiais existem de cada tipo, numa consulta só.
 *
 * Serve para a capa não anunciar uma seção vazia: tipo que o seed ainda não
 * preencheu (IDIOMA, hoje) simplesmente não aparece.
 */
export async function contarPorTipo(): Promise<Map<TipoCatalogo, number>> {
  const linhas = await prisma.itemCatalogo.groupBy({
    by: ["tipo"],
    where: { sistema: SISTEMA, mesaId: null },
    _count: { _all: true },
  });
  return new Map(linhas.map((l) => [l.tipo, l._count._all]));
}
