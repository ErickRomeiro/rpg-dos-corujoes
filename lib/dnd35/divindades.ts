// Divindades do panteão padrão de D&D 3.5.
//
// Transcritas do Livro do Jogador: a Tabela 3-7 (Deuses, p. 32) dá tendência,
// domínios e adoradores típicos, e a arma predileta vem da descrição de cada
// deus no capítulo 6 (p. 106-108), que é onde ela está — a tabela não a traz.
//
// A transcrição confere sozinha: `dominios.ts` já listava, em cada domínio, os
// deuses que o oferecem, e as duas tabelas do livro são independentes uma da
// outra. Cruzando as 22 listas de `deuses` contra os `dominios` daqui, todas
// batem, nos dois sentidos. `npm run tabelas:conferir` refaz esse cruzamento.
//
// Duas escolhas de vocabulário, ambas para que a referência resolva:
//
//   Os domínios usam o plural ("Animais", "Plantas") como no capítulo de
//   domínios e em `dominios.ts`. A Tabela 3-7 imprime no singular ("Animal",
//   "Planta") — é divergência interna do livro, e o capítulo do domínio manda.
//
//   A arma predileta de Nerull sai como "uma foice" na descrição, sem dizer
//   qual. A ilustração é de gadanho e o SRD diz scythe, então é a Foice longa.
//
// Pelor e St. Cuthbert têm "a maça" como arma predileta, sem qualificar; no
// SRD é maça pesada ou leve, à escolha, e é assim que fica aqui.

export type Divindade = {
  id: string;
  nome: string;
  /** Como a Tabela 3-7 qualifica o deus: "Deus do Heroísmo". */
  titulo: string;
  /** Um dos ALINHAMENTOS de lib/ficha.ts. */
  tendencia: string;
  /** Nomes de DOMINIOS em dominios.ts. */
  dominios: string[];
  /** Nome de ARMAS em equipamento.ts; "X ou Y" quando o livro deixa escolher. */
  armaPredileta: string;
  /** Adoradores típicos, como a Tabela 3-7 os lista. */
  adoradores: string;
};

export const DIVINDADES: Divindade[] = [
  { id: "boccob", nome: "Boccob", titulo: "Deus da Magia", tendencia: "Neutro", dominios: ["Conhecimento", "Magia", "Enganação"], armaPredileta: "Bordão", adoradores: "Magos, feiticeiros, sábios" },
  { id: "corellonLarethian", nome: "Corellon Larethian", titulo: "Deus dos Elfos", tendencia: "Caótico e Bom", dominios: ["Caos", "Bem", "Proteção", "Guerra"], armaPredileta: "Espada longa", adoradores: "Elfos, meio-elfos, bardos" },
  { id: "ehlonna", nome: "Ehlonna", titulo: "Deusa das Florestas", tendencia: "Neutro e Bom", dominios: ["Animais", "Bem", "Plantas", "Sol"], armaPredileta: "Arco longo", adoradores: "Elfos, gnomos, meio-elfos, halflings, rangers, druidas" },
  { id: "erythnul", nome: "Erythnul", titulo: "Deus da Matança", tendencia: "Caótico e Mau", dominios: ["Caos", "Mal", "Enganação", "Guerra"], armaPredileta: "Maça-estrela", adoradores: "Guerreiros, bárbaros, ladinos malignos" },
  { id: "fharlanghn", nome: "Fharlanghn", titulo: "Deus das Estradas", tendencia: "Neutro", dominios: ["Sorte", "Proteção", "Viagem"], armaPredileta: "Bordão", adoradores: "Bardos, aventureiros, mercadores" },
  { id: "garlGlittergold", nome: "Garl Glittergold", titulo: "Deus dos Gnomos", tendencia: "Neutro e Bom", dominios: ["Bem", "Proteção", "Enganação"], armaPredileta: "Machado de batalha", adoradores: "Gnomos" },
  { id: "gruumsh", nome: "Gruumsh", titulo: "Deus dos Orcs", tendencia: "Caótico e Mau", dominios: ["Caos", "Mal", "Força", "Guerra"], armaPredileta: "Lança", adoradores: "Meio-orcs, orcs" },
  { id: "heironeous", nome: "Heironeous", titulo: "Deus do Heroísmo", tendencia: "Leal e Bom", dominios: ["Bem", "Ordem", "Guerra"], armaPredileta: "Espada longa", adoradores: "Paladinos, guerreiros, monges" },
  { id: "hextor", nome: "Hextor", titulo: "Deus da Tirania", tendencia: "Leal e Mau", dominios: ["Destruição", "Mal", "Ordem", "Guerra"], armaPredileta: "Mangual", adoradores: "Guerreiros malignos, monges" },
  { id: "kord", nome: "Kord", titulo: "Deus da Força", tendencia: "Caótico e Bom", dominios: ["Caos", "Bem", "Sorte", "Força"], armaPredileta: "Espada larga", adoradores: "Guerreiros, bárbaros, ladinos, atletas" },
  { id: "moradin", nome: "Moradin", titulo: "Deus dos Anões", tendencia: "Leal e Bom", dominios: ["Terra", "Bem", "Ordem", "Proteção"], armaPredileta: "Martelo de guerra", adoradores: "Anões" },
  { id: "nerull", nome: "Nerull", titulo: "Deus da Morte", tendencia: "Neutro e Mau", dominios: ["Morte", "Mal", "Enganação"], armaPredileta: "Foice longa", adoradores: "Necromantes, ladinos malignos" },
  { id: "obadHai", nome: "Obad-Hai", titulo: "Deus da Natureza", tendencia: "Neutro", dominios: ["Ar", "Animais", "Terra", "Fogo", "Plantas", "Água"], armaPredileta: "Bordão", adoradores: "Druidas, bárbaros, rangers" },
  { id: "olidammara", nome: "Olidammara", titulo: "Deus dos Ladrões", tendencia: "Caótico e Neutro", dominios: ["Caos", "Sorte", "Enganação"], armaPredileta: "Sabre", adoradores: "Ladinos, bardos, ladrões" },
  { id: "pelor", nome: "Pelor", titulo: "Deus do Sol", tendencia: "Neutro e Bom", dominios: ["Bem", "Cura", "Força", "Sol"], armaPredileta: "Maça pesada ou Maça leve", adoradores: "Rangers, bardos" },
  { id: "stCuthbert", nome: "St. Cuthbert", titulo: "Deus da Retribuição", tendencia: "Leal e Neutro", dominios: ["Destruição", "Ordem", "Proteção", "Força"], armaPredileta: "Maça pesada ou Maça leve", adoradores: "Guerreiros, monges, soldados" },
  { id: "vecna", nome: "Vecna", titulo: "Deus dos Segredos", tendencia: "Neutro e Mau", dominios: ["Mal", "Conhecimento", "Magia"], armaPredileta: "Adaga", adoradores: "Magos, feiticeiros, ladinos, espiões malignos" },
  { id: "weeJas", nome: "Wee Jas", titulo: "Deusa da Morte e da Magia", tendencia: "Leal e Neutro", dominios: ["Morte", "Ordem", "Magia"], armaPredileta: "Adaga", adoradores: "Magos, necromantes, feiticeiros" },
  { id: "yondalla", nome: "Yondalla", titulo: "Deusa dos Halflings", tendencia: "Leal e Bom", dominios: ["Bem", "Ordem", "Proteção"], armaPredileta: "Espada curta", adoradores: "Halflings" },
];

/**
 * Deuses que `dominios.ts` cita mas que ainda não têm ficha aqui.
 *
 * São o panteão do Livro Completo do Guerreiro, que entrou junto com os
 * domínios daquele livro. A conferência sabe que estes faltam de propósito, em
 * vez de reclamar deles toda vez — quando forem transcritos, saem desta lista.
 */
export const DIVINDADES_POR_TRANSCREVER = [
  "Altua",
  "Halmyr",
  "Lyris",
  "Typhos",
  "Valkar",
];

/**
 * Divindades sugeridas para uma raça (Tabela 6-2, p. 106).
 *
 * O livro diz "ou conforme a classe e a tendência" em todas as linhas: a
 * sugestão racial nunca exclui as outras, só põe algumas à frente.
 */
export const DEUSES_POR_RACA: Record<string, string[]> = {
  humano: [],
  anao: ["Moradin"],
  elfo: ["Corellon Larethian", "Ehlonna"],
  gnomo: ["Garl Glittergold", "Ehlonna"],
  meioElfo: ["Corellon Larethian", "Ehlonna"],
  meioOrc: ["Gruumsh"],
  halfling: ["Yondalla", "Ehlonna"],
};

/**
 * Divindades sugeridas para uma classe (Tabela 6-3, p. 106).
 *
 * Duas linhas da tabela ficaram de fora por não serem classe: "Ilusionistas"
 * (Boccob) e "Necromantes" (Wee Jas, Nerull) são especializações de mago, e a
 * ficha não as modela. Quem joga um mago já recebe a sugestão de mago.
 */
export const DEUSES_POR_CLASSE: Record<string, string[]> = {
  barbaro: ["Kord", "Obad-Hai", "Erythnul"],
  bardo: ["Pelor", "Fharlanghn", "Olidammara"],
  // "Qualquer um" na tabela — clérigo escolhe livremente.
  clerigo: [],
  druida: ["Obad-Hai"],
  guerreiro: ["Heironeous", "Kord", "St. Cuthbert", "Hextor", "Erythnul"],
  monge: ["Heironeous", "St. Cuthbert", "Hextor"],
  paladino: ["Heironeous"],
  patrulheiro: ["Ehlonna", "Obad-Hai"],
  ladino: ["Olidammara", "Nerull", "Vecna", "Erythnul"],
  feiticeiro: ["Wee Jas", "Boccob", "Vecna"],
  mago: ["Wee Jas", "Boccob", "Vecna"],
};

export function divindadePor(nome: string): Divindade | undefined {
  return DIVINDADES.find((d) => d.nome === nome);
}
