// Cores de olhos, cabelo e pele para a ficha.
//
// Estes campos eram texto livre. Viraram lista porque quase ninguém escreve a
// mesma coisa duas vezes ("castanho", "Castanhos", "marrom") e porque cor é o
// tipo de coisa que se escolhe melhor vendo do que lendo.
//
// O que a ficha GRAVA continua sendo o nome em português, não o código da cor.
// Assim a ficha de leitura, a impressão e qualquer export continuam legíveis
// sozinhos, e uma ficha antiga com texto livre continua válida — o campo só
// não acha a cor para desenhar a amostra, e mostra o texto mesmo assim.
//
// As listas incluem tons fantásticos (pele esverdeada, cabelo azulado, olhos
// violeta) porque a mesa tem meio-orcs, elfos e tieflings, e limitar a tons
// humanos obrigaria a voltar ao texto livre justamente nos casos mais comuns
// de personagem não humano.

export type OpcaoCor = {
  /** O que fica gravado na ficha. */
  nome: string;
  /** Só para desenhar a amostra. Vazio = não há cor a mostrar (ex.: Calvo). */
  hex: string;
};

export const CORES_OLHOS: OpcaoCor[] = [
  { nome: "Âmbar", hex: "#c07f26" },
  { nome: "Avelã", hex: "#8a6b3d" },
  { nome: "Azuis", hex: "#3b7dd8" },
  { nome: "Azul-claros", hex: "#8fc4ee" },
  { nome: "Castanhos", hex: "#6b4423" },
  { nome: "Castanho-escuros", hex: "#3d2415" },
  { nome: "Cinzentos", hex: "#8d949c" },
  { nome: "Dourados", hex: "#d4a017" },
  { nome: "Esverdeados", hex: "#7a8c4a" },
  { nome: "Mel", hex: "#b07d39" },
  { nome: "Negros", hex: "#1a1a1a" },
  { nome: "Prateados", hex: "#c3cad1" },
  { nome: "Turquesa", hex: "#3aa8a0" },
  { nome: "Verdes", hex: "#3f8f4f" },
  { nome: "Vermelhos", hex: "#a52a2a" },
  { nome: "Violeta", hex: "#8b5cf6" },
];

export const CORES_CABELO: OpcaoCor[] = [
  { nome: "Loiro-claro", hex: "#e8d5a3" },
  { nome: "Loiro", hex: "#d4b662" },
  { nome: "Loiro-escuro", hex: "#a68a4b" },
  { nome: "Ruivo", hex: "#b44c1e" },
  { nome: "Acobreado", hex: "#c2703d" },
  { nome: "Castanho-claro", hex: "#9a7245" },
  { nome: "Castanho", hex: "#6b4a2b" },
  { nome: "Castanho-escuro", hex: "#43301c" },
  { nome: "Negro", hex: "#17171a" },
  { nome: "Grisalho", hex: "#9ba1a8" },
  { nome: "Branco", hex: "#eceff2" },
  { nome: "Prateado", hex: "#c3cad1" },
  { nome: "Azulado", hex: "#4a6fa5" },
  { nome: "Esverdeado", hex: "#5c7f5c" },
  { nome: "Arroxeado", hex: "#7c5ba6" },
  { nome: "Calvo", hex: "" },
];

export const CORES_PELE: OpcaoCor[] = [
  { nome: "Pálida", hex: "#f0ddd0" },
  { nome: "Clara", hex: "#e8c8a9" },
  { nome: "Rosada", hex: "#e5b8a0" },
  { nome: "Morena clara", hex: "#c99a6d" },
  { nome: "Bronzeada", hex: "#b57e4f" },
  { nome: "Oliva", hex: "#9c8352" },
  { nome: "Morena", hex: "#8d5f3c" },
  { nome: "Parda", hex: "#6f462b" },
  { nome: "Negra", hex: "#4a2c1b" },
  { nome: "Negra retinta", hex: "#2e1a10" },
  { nome: "Acinzentada", hex: "#8f959b" },
  { nome: "Esverdeada", hex: "#6f8a5a" },
  { nome: "Azulada", hex: "#5b7a99" },
  { nome: "Avermelhada", hex: "#a55340" },
  { nome: "Pétrea", hex: "#77726b" },
];

/** Acha a cor de um valor gravado. `undefined` = texto livre de ficha antiga. */
export function corPorNome(
  opcoes: readonly OpcaoCor[],
  nome: string,
): OpcaoCor | undefined {
  if (!nome) return undefined;
  const alvo = nome.trim().toLowerCase();
  return opcoes.find((o) => o.nome.toLowerCase() === alvo);
}
