// Regras do rastreador de iniciativa, separadas do banco e da tela.
//
// Tudo aqui é função pura sobre uma lista de participantes: a ordem da fila, o
// avanço de turno e a correção do índice quando alguém entra ou sai no meio da
// luta. É o que permite raciocinar sobre a virada de rodada sem subir um
// combate no banco.

/** O mínimo que a ordenação precisa saber de um participante. */
export type Ordenavel = {
  id: string;
  iniciativa: number;
  modIniciativa: number;
  ordem: number;
};

/**
 * Ordena a fila de combate segundo o 3.5: maior iniciativa primeiro; empate
 * resolve pelo maior modificador de Destreza/iniciativa.
 *
 * Persistindo o empate, o livro manda os envolvidos combinarem entre si a
 * ordem. Aqui isso vira a ordem de entrada no combate — um critério qualquer,
 * mas *estável*, que é o que impede a fila de sacudir a cada render e o mestre
 * de perder a conta de quem já agiu.
 */
export function ordenar<T extends Ordenavel>(participantes: T[]): T[] {
  return [...participantes].sort(
    (a, b) =>
      b.iniciativa - a.iniciativa ||
      b.modIniciativa - a.modIniciativa ||
      a.ordem - b.ordem,
  );
}

/**
 * Onde o turno realmente está, dado um índice que pode ter ficado para fora.
 *
 * O índice é guardado cru no banco e a fila muda de tamanho durante a luta;
 * em vez de espalhar checagem de limite por toda parte, a leitura passa por
 * aqui. Fila vazia devolve 0, que nenhuma linha vai casar.
 */
export function turnoValido(turno: number, total: number): number {
  if (total <= 0) return 0;
  // O módulo cobre tanto índice além do fim (alguém saiu) quanto negativo.
  return ((turno % total) + total) % total;
}

export type Avanco = { turno: number; rodada: number };

/**
 * Passa a vez. Ao dar a volta na fila, a rodada sobe — é o que marca o fim de
 * uma rodada de combate no 3.5, e não a passagem de um tempo qualquer.
 */
export function avancar(turno: number, rodada: number, total: number): Avanco {
  if (total <= 0) return { turno: 0, rodada };
  const atual = turnoValido(turno, total);
  const proximo = atual + 1;
  return proximo >= total
    ? { turno: 0, rodada: rodada + 1 }
    : { turno: proximo, rodada };
}

/**
 * Volta a vez, desfazendo inclusive a virada de rodada.
 *
 * Existe para corrigir engano na mesa — clicou demais, ou o jogador lembrou de
 * uma ação depois. A rodada nunca desce de 1: voltar antes do começo do
 * combate não significa nada.
 */
export function voltar(turno: number, rodada: number, total: number): Avanco {
  if (total <= 0) return { turno: 0, rodada };
  const atual = turnoValido(turno, total);
  if (atual > 0) return { turno: atual - 1, rodada };
  return rodada > 1
    ? { turno: total - 1, rodada: rodada - 1 }
    : { turno: 0, rodada: 1 };
}

/**
 * Corrige o índice do turno depois que alguém sai da fila.
 *
 * Quem morreu ou fugiu some da ordem, e o índice cru passaria a apontar para o
 * participante seguinte — na prática, pulando a vez de alguém. As três
 * situações:
 *
 * - saiu antes da vez atual: a fila andou para trás, o índice acompanha;
 * - saiu quem estava agindo: o índice fica onde está, porque quem era o
 *   próximo assumiu aquela posição;
 * - saiu depois: nada muda.
 */
export function turnoAposRemover(
  turno: number,
  indiceRemovido: number,
  totalAntes: number,
): number {
  const atual = turnoValido(turno, totalAntes);
  const total = totalAntes - 1;
  if (total <= 0) return 0;
  const ajustado = indiceRemovido < atual ? atual - 1 : atual;
  // Remover o último da fila enquanto ele agia devolve a vez ao começo, que é
  // também quando a rodada viraria.
  return turnoValido(ajustado, total);
}

/** Rola 1d20 e soma o modificador. O sorteio entra por parâmetro, como em lib/dados.ts. */
export function rolarIniciativa(
  modificador: number,
  sortear: (faces: number) => number = (faces) =>
    Math.floor(Math.random() * faces) + 1,
): number {
  return sortear(20) + modificador;
}
