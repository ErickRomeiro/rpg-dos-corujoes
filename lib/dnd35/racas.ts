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
  },
];

/** Aceita id ("anao") ou nome ("Anão"), como `classePor`. */
export function racaPor(chave: string): Raca | undefined {
  if (!chave) return undefined;
  const alvo = chave.toLowerCase();
  return RACAS.find(
    (r) => r.id.toLowerCase() === alvo || r.nome.toLowerCase() === alvo,
  );
}
