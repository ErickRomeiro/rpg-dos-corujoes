// Classes do núcleo de D&D 3.5 (SRD).
//
// O que está aqui é o suficiente para a ficha se preencher: dado de vida,
// progressão de BBA, quais resistências são boas, pontos de perícia e a lista
// de perícias de classe. Habilidades de classe por nível ficam fora — são
// muitas e variam demais para caber num autopreenchimento útil.

export type ProgressaoBba = "boa" | "media" | "ruim";

export type Classe = {
  id: string;
  nome: string;
  /** Faces do dado de vida (d8 → 8). */
  dadoVida: number;
  bba: ProgressaoBba;
  /** Resistências com progressão boa; as demais são ruins. */
  resistenciasBoas: ("fortitude" | "reflexos" | "vontade")[];
  /** Pontos de perícia por nível (some o modificador de INT). */
  pontosPericia: number;
  /** Ids de PERICIAS que são de classe. */
  periciasClasse: string[];
  /** Atributo-chave de conjuração, quando a classe lança magias. */
  conjuracao?: "inteligencia" | "sabedoria" | "carisma";
};

export const CLASSES: Classe[] = [
  {
    id: "barbaro",
    nome: "Bárbaro",
    dadoVida: 12,
    bba: "boa",
    resistenciasBoas: ["fortitude"],
    pontosPericia: 4,
    periciasClasse: [
      "adestrarAnimais", "cavalgar", "escalar", "intimidar", "natacao",
      "oficio", "ouvir", "saltar", "sobrevivencia",
    ],
  },
  {
    id: "bardo",
    nome: "Bardo",
    dadoVida: 6,
    bba: "media",
    resistenciasBoas: ["reflexos", "vontade"],
    pontosPericia: 6,
    conjuracao: "carisma",
    periciasClasse: [
      "acrobacia", "arteDaFuga", "atuacao", "avaliacao", "blefar",
      "concentracao", "conhecimento", "decifrarEscrita", "diplomacia",
      "disfarce", "equilibrio", "escalar", "esconderSe", "falsificacao",
      "furtividade", "identificarMagia", "intimidar", "natacao",
      "obterInformacao", "oficio", "ouvir", "prestidigitacao", "profissao",
      "saltar", "sentirMotivacao", "usarInstrumentoMagico",
    ],
  },
  {
    id: "clerigo",
    nome: "Clérigo",
    dadoVida: 8,
    bba: "media",
    resistenciasBoas: ["fortitude", "vontade"],
    pontosPericia: 2,
    conjuracao: "sabedoria",
    periciasClasse: [
      "concentracao", "conhecimento", "cura", "diplomacia",
      "identificarMagia", "oficio", "profissao",
    ],
  },
  {
    id: "druida",
    nome: "Druida",
    dadoVida: 8,
    bba: "media",
    resistenciasBoas: ["fortitude", "vontade"],
    pontosPericia: 4,
    conjuracao: "sabedoria",
    periciasClasse: [
      "adestrarAnimais", "cavalgar", "concentracao", "conhecimento", "cura",
      "diplomacia", "identificarMagia", "natacao", "observar", "oficio",
      "ouvir", "profissao", "sobrevivencia",
    ],
  },
  {
    id: "guerreiro",
    nome: "Guerreiro",
    dadoVida: 10,
    bba: "boa",
    resistenciasBoas: ["fortitude"],
    pontosPericia: 2,
    periciasClasse: [
      "adestrarAnimais", "cavalgar", "escalar", "intimidar", "natacao",
      "oficio", "saltar",
    ],
  },
  {
    id: "ladino",
    nome: "Ladino",
    dadoVida: 6,
    bba: "media",
    resistenciasBoas: ["reflexos"],
    pontosPericia: 8,
    periciasClasse: [
      "abrirFechaduras", "acrobacia", "arteDaFuga", "atuacao", "avaliacao",
      "blefar", "concentracao", "conhecimento", "decifrarEscrita",
      "diplomacia", "disfarce", "equilibrio", "escalar", "esconderSe",
      "falsificacao", "furtividade", "intimidar", "natacao",
      "obterInformacao", "oficio", "operarMecanismo", "ouvir",
      "prestidigitacao", "procurar", "profissao", "saltar", "sentirMotivacao",
      "usarCordas", "usarInstrumentoMagico",
    ],
  },
  {
    id: "mago",
    nome: "Mago",
    dadoVida: 4,
    bba: "ruim",
    resistenciasBoas: ["vontade"],
    pontosPericia: 2,
    conjuracao: "inteligencia",
    periciasClasse: [
      "concentracao", "conhecimento", "decifrarEscrita", "identificarMagia",
      "oficio", "profissao",
    ],
  },
  {
    id: "monge",
    nome: "Monge",
    dadoVida: 8,
    bba: "media",
    resistenciasBoas: ["fortitude", "reflexos", "vontade"],
    pontosPericia: 4,
    periciasClasse: [
      "acrobacia", "arteDaFuga", "atuacao", "concentracao", "conhecimento",
      "diplomacia", "equilibrio", "escalar", "esconderSe", "furtividade",
      "natacao", "observar", "oficio", "ouvir", "profissao", "saltar",
      "sentirMotivacao",
    ],
  },
  {
    id: "paladino",
    nome: "Paladino",
    dadoVida: 10,
    bba: "boa",
    resistenciasBoas: ["fortitude"],
    pontosPericia: 2,
    conjuracao: "sabedoria",
    periciasClasse: [
      "adestrarAnimais", "cavalgar", "concentracao", "conhecimento", "cura",
      "diplomacia", "oficio", "profissao", "sentirMotivacao",
    ],
  },
  {
    id: "patrulheiro",
    nome: "Patrulheiro",
    dadoVida: 8,
    bba: "boa",
    resistenciasBoas: ["fortitude", "reflexos"],
    pontosPericia: 6,
    conjuracao: "sabedoria",
    periciasClasse: [
      "adestrarAnimais", "cavalgar", "concentracao", "conhecimento", "cura",
      "escalar", "esconderSe", "furtividade", "natacao", "observar", "oficio",
      "ouvir", "procurar", "profissao", "saltar", "sobrevivencia",
      "usarCordas",
    ],
  },
  {
    id: "feiticeiro",
    nome: "Feiticeiro",
    dadoVida: 4,
    bba: "ruim",
    resistenciasBoas: ["vontade"],
    pontosPericia: 2,
    conjuracao: "carisma",
    periciasClasse: [
      "blefar", "concentracao", "conhecimento", "identificarMagia", "oficio",
      "profissao",
    ],
  },
];

/**
 * Aceita id ("guerreiro") ou nome ("Guerreiro"). A ficha grava o nome, que é o
 * que aparece no catálogo e permite classes de fora do núcleo; o id continua
 * valendo para quem referencia a tabela direto.
 */
export function classePor(chave: string): Classe | undefined {
  if (!chave) return undefined;
  const alvo = chave.toLowerCase();
  return CLASSES.find(
    (c) => c.id.toLowerCase() === alvo || c.nome.toLowerCase() === alvo,
  );
}

/** BBA de uma classe no nível dado. */
export function bbaDaClasse(progressao: ProgressaoBba, nivel: number): number {
  if (nivel <= 0) return 0;
  if (progressao === "boa") return nivel;
  if (progressao === "media") return Math.floor((nivel * 3) / 4);
  return Math.floor(nivel / 2);
}

/**
 * Resistência-base: progressão boa começa em +2 e sobe 1 a cada 2 níveis;
 * a ruim sobe 1 a cada 3 níveis.
 */
export function resistenciaBase(boa: boolean, nivel: number): number {
  if (nivel <= 0) return 0;
  return boa ? 2 + Math.floor(nivel / 2) : Math.floor(nivel / 3);
}

/** Ataques múltiplos do BBA: 6 vira "+6/+1". */
export function bbaProgressivo(bba: number): string {
  if (bba <= 0) return "+0";
  const ataques: number[] = [];
  for (let b = bba; b > 0; b -= 5) ataques.push(b);
  return ataques.map((a) => `+${a}`).join("/");
}
