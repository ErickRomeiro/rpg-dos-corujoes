// Raças do D&D 3.5 (SRD / Livro do Jogador), com o que dá para preencher
// sozinho numa ficha: ajustes de atributo, tamanho, deslocamento, idiomas e
// bônus raciais de perícia.
//
// Os ajustes de atributo NÃO são aplicados automaticamente aos valores
// digitados — o jogador informa o valor final do atributo, e a ficha mostra o
// ajuste como lembrete, com um botão para aplicar quando ele quiser.

import type { ChaveAtributo } from "../ficha.ts";

export type Raca = {
  id: string;
  nome: string;
  /** Ajustes raciais de atributo, ex.: { constituicao: 2, carisma: -2 }. */
  ajustes: Partial<Record<ChaveAtributo, number>>;
  /** Id de TAMANHOS em lib/ficha.ts. */
  tamanho: string;
  deslocamento: string;
  idiomas: string;
  /** Bônus raciais por id de perícia — entram na coluna "diversos". */
  periciasBonus: Record<string, number>;
  /** Traços narrados na seção de habilidades especiais. */
  tracos: { nome: string; notas: string }[];
  /** Idade, altura e peso típicos. Ausente em raça de mesa. */
  fisico?: FisicoRacial;
};

/**
 * Medidas de um sexo, como a Tabela 6-6 (Altura e Peso Aleatórios, p. 109) as
 * dá: uma base fixa mais uma rolagem.
 *
 * A altura é `alturaBase + rolagem(alturaDados) × 2,5 cm`. O peso é
 * `pesoBase + rolagem(alturaDados) × multiplicador` — repare que é a MESMA
 * rolagem da altura, e é isso que faz personagem alto sair pesado. O
 * multiplicador é `rolagem(pesoDados) × 0,5 kg`, ou 0,5 kg fixo quando a
 * tabela não traz dado (gnomos e halflings).
 */
export type MedidasSexo = {
  /** Em metros. */
  alturaBase: number;
  /** Ex.: "2d10". Cada ponto rolado vale 2,5 cm. */
  alturaDados: string;
  /** Em quilos. */
  pesoBase: number;
  /** Ex.: "2d4". null = multiplicador fixo de 0,5 kg por ponto. */
  pesoDados: string | null;
};

/**
 * Idade, altura e peso de uma raça, das Tabelas 6-4, 6-5 e 6-6 (p. 109).
 *
 * Serve para a ficha sugerir o que é típico sem impor nada: o livro manda
 * escolher ou rolar, e o jogador continua digitando o que quiser.
 */
export type FisicoRacial = {
  /** Tabela 6-4: idade em que a raça passa a ser adulta. */
  idadeAdulta: number;
  /**
   * Tabela 6-4: dados somados à idade adulta, conforme o quanto a classe
   * exige de preparo. Rápido é bárbaro, ladino e feiticeiro; médio é bardo,
   * guerreiro, paladino e patrulheiro; lento é clérigo, druida, monge e mago.
   */
  idadeExtra: { rapido: string; medio: string; lento: string };
  /** Tabela 6-5: idade em que começam os efeitos de envelhecimento. */
  maturidade: number;
  velho: number;
  veneravel: number;
  /** Tabela 6-5: rolagem somada à idade venerável para achar a máxima. */
  idadeMaxima: string;
  masculino: MedidasSexo;
  feminino: MedidasSexo;
};

export const RACAS: Raca[] = [
  {
    id: "anao",
    nome: "Anão",
    ajustes: { constituicao: 2, carisma: -2 },
    tamanho: "medio",
    deslocamento: "6 m",
    idiomas: "Comum, Anão",
    periciasBonus: { avaliacao: 2, oficio: 2, procurar: 2 },
    tracos: [
      { nome: "Visão no escuro", notas: "18 m." },
      { nome: "Treinamento com pedra", notas: "+2 em Procurar para achar portas secretas em pedra; teste automático ao passar a 3 m." },
      { nome: "Estabilidade", notas: "+4 contra derrubar ou empurrar em terreno firme." },
      { nome: "Resistência", notas: "+2 em resistências contra veneno e contra magias." },
      { nome: "Inimigos raciais", notas: "+1 de ataque contra orcs e goblinoides; +4 de CA contra gigantes." },
    ],
    fisico: {
      idadeAdulta: 40,
      idadeExtra: { rapido: "3d6", medio: "5d6", lento: "7d6" },
      maturidade: 125,
      velho: 188,
      veneravel: 250,
      idadeMaxima: "2d%",
      masculino: { alturaBase: 1.25, alturaDados: "2d4", pesoBase: 65, pesoDados: "2d6" },
      feminino: { alturaBase: 1.2, alturaDados: "2d4", pesoBase: 50, pesoDados: "2d6" },
    },
  },
  {
    id: "elfo",
    nome: "Elfo",
    ajustes: { destreza: 2, constituicao: -2 },
    tamanho: "medio",
    deslocamento: "9 m",
    idiomas: "Comum, Élfico",
    periciasBonus: { ouvir: 2, observar: 2, procurar: 2 },
    tracos: [
      { nome: "Visão na penumbra", notas: "Enxerga ao dobro da distância na penumbra." },
      { nome: "Imunidade a sono", notas: "Imune a magias de sono; +2 contra encantamentos." },
      { nome: "Portas secretas", notas: "Teste automático de Procurar ao passar a 1,5 m de uma porta secreta." },
    ],
    fisico: {
      idadeAdulta: 110,
      idadeExtra: { rapido: "4d6", medio: "6d6", lento: "10d6" },
      maturidade: 175,
      velho: 263,
      veneravel: 350,
      idadeMaxima: "4d%",
      masculino: { alturaBase: 1.45, alturaDados: "2d6", pesoBase: 42, pesoDados: "1d6" },
      feminino: { alturaBase: 1.45, alturaDados: "2d6", pesoBase: 40, pesoDados: "1d6" },
    },
  },
  {
    id: "gnomo",
    nome: "Gnomo",
    ajustes: { constituicao: 2, forca: -2 },
    tamanho: "pequeno",
    deslocamento: "6 m",
    idiomas: "Comum, Gnomo",
    periciasBonus: { ouvir: 2, oficio: 2 },
    tracos: [
      { nome: "Visão na penumbra", notas: "Enxerga ao dobro da distância na penumbra." },
      { nome: "Inimigos raciais", notas: "+1 de ataque contra kobolds e goblinoides; +4 de CA contra gigantes." },
      { nome: "Resistência a ilusão", notas: "+2 em resistências contra ilusões." },
      { nome: "Magias inatas", notas: "Fala com Animais 1×/dia; Luzes Dançantes, Consertar e Som Fantasma com CAR 10+." },
    ],
    fisico: {
      idadeAdulta: 40,
      idadeExtra: { rapido: "4d6", medio: "6d6", lento: "9d6" },
      maturidade: 100,
      velho: 150,
      veneravel: 200,
      idadeMaxima: "3d%",
      masculino: { alturaBase: 0.9, alturaDados: "2d4", pesoBase: 20, pesoDados: null },
      feminino: { alturaBase: 0.85, alturaDados: "2d4", pesoBase: 17, pesoDados: null },
    },
  },
  {
    id: "meioElfo",
    nome: "Meio-elfo",
    ajustes: {},
    tamanho: "medio",
    deslocamento: "9 m",
    idiomas: "Comum, Élfico",
    periciasBonus: { ouvir: 1, observar: 1, procurar: 1, diplomacia: 2, obterInformacao: 2 },
    tracos: [
      { nome: "Visão na penumbra", notas: "Enxerga ao dobro da distância na penumbra." },
      { nome: "Sangue élfico", notas: "Imune a sono; +2 contra encantamentos." },
    ],
    fisico: {
      idadeAdulta: 20,
      idadeExtra: { rapido: "1d6", medio: "2d6", lento: "3d6" },
      maturidade: 62,
      velho: 93,
      veneravel: 125,
      idadeMaxima: "3d20",
      masculino: { alturaBase: 1.55, alturaDados: "2d8", pesoBase: 50, pesoDados: "2d4" },
      feminino: { alturaBase: 1.45, alturaDados: "2d8", pesoBase: 40, pesoDados: "2d4" },
    },
  },
  {
    id: "meioOrc",
    nome: "Meio-orc",
    ajustes: { forca: 2, inteligencia: -2, carisma: -2 },
    tamanho: "medio",
    deslocamento: "9 m",
    idiomas: "Comum, Orc",
    periciasBonus: {},
    tracos: [{ nome: "Visão no escuro", notas: "18 m." }],
    fisico: {
      idadeAdulta: 14,
      idadeExtra: { rapido: "1d4", medio: "1d6", lento: "2d6" },
      maturidade: 30,
      velho: 45,
      veneravel: 60,
      idadeMaxima: "2d10",
      masculino: { alturaBase: 1.65, alturaDados: "2d10", pesoBase: 65, pesoDados: "2d4" },
      feminino: { alturaBase: 1.45, alturaDados: "2d10", pesoBase: 45, pesoDados: "2d4" },
    },
  },
  {
    id: "halfling",
    nome: "Halfling",
    ajustes: { destreza: 2, forca: -2 },
    tamanho: "pequeno",
    deslocamento: "6 m",
    idiomas: "Comum, Halfling",
    periciasBonus: { escalar: 2, saltar: 2, furtividade: 2, ouvir: 2 },
    tracos: [
      { nome: "Sortudo", notas: "+1 em todos os testes de resistência." },
      { nome: "Corajoso", notas: "+2 em resistências contra medo (acumula com o +1 racial)." },
      { nome: "Arremesso preciso", notas: "+1 de ataque com armas de arremesso e projéteis." },
    ],
    fisico: {
      idadeAdulta: 20,
      idadeExtra: { rapido: "2d4", medio: "3d6", lento: "4d6" },
      maturidade: 50,
      velho: 75,
      veneravel: 100,
      idadeMaxima: "5d20",
      masculino: { alturaBase: 0.8, alturaDados: "2d4", pesoBase: 15, pesoDados: null },
      feminino: { alturaBase: 0.75, alturaDados: "2d4", pesoBase: 12, pesoDados: null },
    },
  },
  {
    id: "humano",
    nome: "Humano",
    ajustes: {},
    tamanho: "medio",
    deslocamento: "9 m",
    idiomas: "Comum",
    periciasBonus: {},
    tracos: [
      { nome: "Talento extra", notas: "Um talento adicional no 1º nível." },
      { nome: "Perícias extras", notas: "4 pontos de perícia extras no 1º nível e +1 por nível." },
    ],
    fisico: {
      idadeAdulta: 15,
      idadeExtra: { rapido: "1d4", medio: "1d6", lento: "2d6" },
      maturidade: 35,
      velho: 53,
      veneravel: 70,
      idadeMaxima: "2d20",
      masculino: { alturaBase: 1.6, alturaDados: "2d10", pesoBase: 60, pesoDados: "2d4" },
      feminino: { alturaBase: 1.45, alturaDados: "2d10", pesoBase: 42, pesoDados: "2d4" },
    },
  },
];

/** Menor e maior resultado de uma expressão como "2d10" ou "2d%". */
function faixaDoDado(expr: string): [number, number] {
  const m = /^(\d+)d(\d+|%)$/.exec(expr);
  if (!m) return [0, 0];
  const quantos = Number(m[1]);
  const faces = m[2] === "%" ? 100 : Number(m[2]);
  return [quantos, quantos * faces];
}

const virgula = (n: number, casas: number) =>
  n.toFixed(casas).replace(".", ",");

function faixaDeMedidas(m: MedidasSexo) {
  const [altMin, altMax] = faixaDoDado(m.alturaDados);
  // Cada ponto rolado vale 2,5 cm.
  const altura: [number, number] = [
    m.alturaBase + altMin * 0.025,
    m.alturaBase + altMax * 0.025,
  ];
  // O peso extra é a rolagem DA ALTURA vezes o multiplicador, então os
  // extremos de peso são os extremos dos dois ao mesmo tempo.
  const [multMin, multMax] = m.pesoDados
    ? (faixaDoDado(m.pesoDados).map((v) => v * 0.5) as [number, number])
    : [0.5, 0.5];
  const peso: [number, number] = [
    m.pesoBase + altMin * multMin,
    m.pesoBase + altMax * multMax,
  ];
  return { altura, peso };
}

/**
 * O que é típico para a raça, pronto para virar dica de campo.
 *
 * A faixa de idade vai da idade adulta ao começo da maturidade (Tabelas 6-4 e
 * 6-5): é a janela em que a maioria dos personagens jogáveis está, antes de
 * qualquer penalidade de envelhecimento.
 *
 * Altura e peso saem da Tabela 6-6 e mudam com o sexo. Sem sexo escolhido,
 * junta os dois — o campo não deve sugerir um sexo que o jogador não disse.
 * A faixa de peso é larga porque a do livro é: peso mínimo exige rolar mínimo
 * na altura E no multiplicador.
 */
export function faixasFisicas(
  fisico: FisicoRacial | undefined,
  sexo: string,
): { idade: string; altura: string; peso: string } | undefined {
  if (!fisico) return undefined;

  const s = sexo.trim().toLowerCase();
  const medidas =
    s === "masculino"
      ? [fisico.masculino]
      : s === "feminino"
        ? [fisico.feminino]
        : [fisico.masculino, fisico.feminino];

  const faixas = medidas.map(faixaDeMedidas);
  const menor = (f: (x: (typeof faixas)[number]) => [number, number]) =>
    Math.min(...faixas.map((x) => f(x)[0]));
  const maior = (f: (x: (typeof faixas)[number]) => [number, number]) =>
    Math.max(...faixas.map((x) => f(x)[1]));

  return {
    idade: `${fisico.idadeAdulta} a ${fisico.maturidade}`,
    altura: `${virgula(menor((x) => x.altura), 2)} a ${virgula(maior((x) => x.altura), 2)} m`,
    peso: `${Math.round(menor((x) => x.peso))} a ${Math.round(maior((x) => x.peso))} kg`,
  };
}

/** Aceita id ("anao") ou nome ("Anão"), como `classePor`. */
export function racaPor(chave: string): Raca | undefined {
  if (!chave) return undefined;
  const alvo = chave.toLowerCase();
  return RACAS.find(
    (r) => r.id.toLowerCase() === alvo || r.nome.toLowerCase() === alvo,
  );
}
