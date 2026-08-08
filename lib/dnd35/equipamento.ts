// Armas e armaduras de D&D 3.5.
//
// As duas tabelas são o Livro do Jogador transcrito linha a linha: Tabela 7-5
// (Armas, p. 116-117) e Tabela 7-6 (Armaduras e Escudos, p. 123). Nome, custo,
// dano, crítico, alcance, peso e tipo saem de lá como estão impressos.
//
// Este arquivo já foi escrito a partir do SRD em inglês e traduzido por fora, e
// divergia do livro em nome e em número. `apelidos` guarda o nome antigo de
// cada linha renomeada, e `armaPor`/`armaduraPor` também procuram por ele, para
// que ficha e busca antigas continuem achando.
//
// UM NOME ANTIGO NÃO VIROU APELIDO, porque hoje pertence a outra armadura:
//
//   "Meia-armadura" aqui tinha +6 CA / Des +1 / -6 / 35%, que no livro é a
//                   Loriga Segmentada — que faltava nesta tabela. A Meia
//                   Armadura de verdade é +7 CA / Des +0 / -7 / 40%, e é o que
//                   estava aqui sob o nome inventado "Placas parciais".
//
// Ou seja, os nomes estavam deslocados em uma linha. Ficha antiga com
// "Meia-armadura" queria a Loriga Segmentada, mas apelidar seria apontar para
// a Meia Armadura de hoje, que é 1 ponto de CA acima e 1 de Destreza abaixo.
// Fica sem apelido de propósito: é para a busca falhar e alguém olhar.
//
// Pesos em quilos e alcances em metros, como o livro brasileiro imprime (não é
// conversão nossa). O dano de tamanho Médio é o que a ficha usa por padrão;
// `danoP` fica para personagem Pequeno. Tudo continua editável na ficha.
//
// TRÊS DIVERGÊNCIAS DO IMPRESSO, resolvidas contra a planilha da mesa e o SRD:
//
//   Foice curta       — a tabela imprime tipo "Concussão e perfurante", que é
//                       o tipo da Maça-estrela, a linha logo acima. Sickle é
//                       cortante na planilha e no SRD. Ficou Cortante.
//   Cota de Talas     — a tabela imprime "20 PO", fora de sequência (a Loriga
//                       Segmentada, de penalidade menor, custa 250). Splint
//                       mail é 200 PO no SRD. Ficou 200 PO.
//   Armadura de Batalha — a Tabela 7-6 a chama assim, mas a descrição na mesma
//                       página a chama "Armadura Completa". Ficou o nome da
//                       tabela, que é o que este arquivo transcreve; o outro
//                       está em `apelidos`.
//
// A capitalização segue o impresso: a tabela de armas usa caixa de frase
// ("Espada longa") e a de armaduras usa caixa alta ("Cota de Malha"). É
// tipografia do livro, não descuido daqui.

export type ArmaduraModelo = {
  nome: string;
  categoria: "Leve" | "Média" | "Pesada" | "Escudo" | "Acessório";
  /** Como o livro imprime, porque nem tudo é número ("especial", "+ 50 PO"). */
  custo: string;
  /** null = a linha não concede bônus (acessórios). */
  bonusCa: number | null;
  /** null = sem limite (escudos não limitam Destreza). */
  desMax: number | null;
  penalidade: number | null;
  falhaMagia: number | null;
  /** Deslocamento de quem anda 9 m sem armadura. Vazio = não altera. */
  deslocamento9: string;
  /** Deslocamento de quem anda 6 m sem armadura. Vazio = não altera. */
  deslocamento6: string;
  /** null = "especial" na tabela, ou peso que se soma a outra peça. */
  peso: number | null;
  /** Nomes que esta linha já teve aqui. Só para busca não quebrar. */
  apelidos?: string[];
};

export const ARMADURAS: ArmaduraModelo[] = [
  // --- Armaduras leves ---
  { nome: "Acolchoada", categoria: "Leve", custo: "5 PO", bonusCa: 1, desMax: 8, penalidade: 0, falhaMagia: 5, deslocamento9: "9 m", deslocamento6: "6 m", peso: 5 },
  { nome: "Couro", categoria: "Leve", custo: "10 PO", bonusCa: 2, desMax: 6, penalidade: 0, falhaMagia: 10, deslocamento9: "9 m", deslocamento6: "6 m", peso: 7.5 },
  { nome: "Couro batido", categoria: "Leve", custo: "25 PO", bonusCa: 3, desMax: 5, penalidade: -1, falhaMagia: 15, deslocamento9: "9 m", deslocamento6: "6 m", peso: 10 },
  { nome: "Camisão de Cota de Malha", categoria: "Leve", custo: "100 PO", bonusCa: 4, desMax: 4, penalidade: -2, falhaMagia: 20, deslocamento9: "9 m", deslocamento6: "6 m", peso: 12.5, apelidos: ["Camisão de malha"] },

  // --- Armaduras médias ---
  { nome: "Gibão de Peles", categoria: "Média", custo: "15 PO", bonusCa: 3, desMax: 4, penalidade: -3, falhaMagia: 20, deslocamento9: "6 m", deslocamento6: "4,5 m", peso: 12.5, apelidos: ["Gibão de peles"] },
  { nome: "Brunea", categoria: "Média", custo: "50 PO", bonusCa: 4, desMax: 3, penalidade: -4, falhaMagia: 25, deslocamento9: "6 m", deslocamento6: "4,5 m", peso: 15 },
  { nome: "Cota de Malha", categoria: "Média", custo: "150 PO", bonusCa: 5, desMax: 2, penalidade: -5, falhaMagia: 30, deslocamento9: "6 m", deslocamento6: "4,5 m", peso: 20, apelidos: ["Cota de malha"] },
  { nome: "Peitoral de Aço", categoria: "Média", custo: "200 PO", bonusCa: 5, desMax: 3, penalidade: -4, falhaMagia: 25, deslocamento9: "6 m", deslocamento6: "4,5 m", peso: 15, apelidos: ["Peitoral"] },

  // --- Armaduras pesadas ---
  // O custo impresso da Cota de Talas é "20 PO"; ver o cabeçalho.
  { nome: "Cota de Talas", categoria: "Pesada", custo: "200 PO", bonusCa: 6, desMax: 0, penalidade: -7, falhaMagia: 40, deslocamento9: "6 m", deslocamento6: "4,5 m", peso: 22.5, apelidos: ["Cota de talas"] },
  // Sem apelido de propósito: quem tem "Meia-armadura" gravado queria isto,
  // mas "Meia Armadura" hoje é a linha de baixo. Ver o cabeçalho.
  { nome: "Loriga Segmentada", categoria: "Pesada", custo: "250 PO", bonusCa: 6, desMax: 1, penalidade: -6, falhaMagia: 35, deslocamento9: "6 m", deslocamento6: "4,5 m", peso: 17.5 },
  { nome: "Meia Armadura", categoria: "Pesada", custo: "600 PO", bonusCa: 7, desMax: 0, penalidade: -7, falhaMagia: 40, deslocamento9: "6 m", deslocamento6: "4,5 m", peso: 25, apelidos: ["Placas parciais"] },
  { nome: "Armadura de Batalha", categoria: "Pesada", custo: "1.500 PO", bonusCa: 8, desMax: 1, penalidade: -6, falhaMagia: 35, deslocamento9: "6 m", deslocamento6: "4,5 m", peso: 25, apelidos: ["Armadura completa", "Armadura Completa"] },

  // --- Escudos ---
  { nome: "Broquel", categoria: "Escudo", custo: "15 PO", bonusCa: 1, desMax: null, penalidade: -1, falhaMagia: 5, deslocamento9: "", deslocamento6: "", peso: 2.5 },
  { nome: "Escudo Pequeno de Madeira", categoria: "Escudo", custo: "3 PO", bonusCa: 1, desMax: null, penalidade: -1, falhaMagia: 5, deslocamento9: "", deslocamento6: "", peso: 2.5, apelidos: ["Escudo leve de madeira"] },
  { nome: "Escudo Pequeno de Metal", categoria: "Escudo", custo: "9 PO", bonusCa: 1, desMax: null, penalidade: -1, falhaMagia: 5, deslocamento9: "", deslocamento6: "", peso: 3, apelidos: ["Escudo leve de aço"] },
  { nome: "Escudo Grande de Madeira", categoria: "Escudo", custo: "7 PO", bonusCa: 2, desMax: null, penalidade: -2, falhaMagia: 15, deslocamento9: "", deslocamento6: "", peso: 5, apelidos: ["Escudo pesado de madeira"] },
  { nome: "Escudo Grande de Metal", categoria: "Escudo", custo: "20 PO", bonusCa: 2, desMax: null, penalidade: -2, falhaMagia: 15, deslocamento9: "", deslocamento6: "", peso: 7.5, apelidos: ["Escudo pesado de aço"] },
  { nome: "Escudo de Corpo", categoria: "Escudo", custo: "30 PO", bonusCa: 4, desMax: 2, penalidade: -10, falhaMagia: 50, deslocamento9: "", deslocamento6: "", peso: 22.5, apelidos: ["Escudo corporal"] },

  // --- Acessórios ---
  // Peso e custo destes se somam à peça em que são montados.
  { nome: "Cravos para Armadura", categoria: "Acessório", custo: "+ 50 PO", bonusCa: null, desMax: null, penalidade: null, falhaMagia: null, deslocamento9: "", deslocamento6: "", peso: 5 },
  { nome: "Manopla de Segurança", categoria: "Acessório", custo: "8 PO", bonusCa: null, desMax: null, penalidade: null, falhaMagia: null, deslocamento9: "", deslocamento6: "", peso: 2.5 },
  { nome: "Cravos para Escudos", categoria: "Acessório", custo: "+ 10 PO", bonusCa: null, desMax: null, penalidade: null, falhaMagia: null, deslocamento9: "", deslocamento6: "", peso: 2.5 },
];

export type ArmaModelo = {
  nome: string;
  /** O livro chama as marciais de "comuns", e os talentos daqui já seguem isso. */
  categoria: "Simples" | "Comum" | "Exótica";
  /** Divisão da tabela: é o que define arma leve, de duas mãos e afins. */
  manejo: "Desarmado" | "Leve" | "Uma mão" | "Duas mãos" | "Distância";
  /** Como o livro imprime, porque nem tudo é número ("especial", "5 PP"). */
  custo: string;
  /** Dano para usuário Pequeno. */
  danoP: string;
  /** Dano para usuário Médio — é o que a ficha usa por padrão. */
  dano: string;
  critico: string;
  /** Vazio = corpo a corpo. */
  alcance: string;
  tipo: string;
  /** null = "especial" na tabela (escudos e armadura com cravos). */
  peso: number | null;
  /** Nota 3 da tabela: causa dano por contusão em vez de dano letal. */
  naoLetal?: boolean;
  /** Nota 4 da tabela: arma de haste, que atinge a 3 m. */
  haste?: boolean;
  /** Nota 5 da tabela: arma dupla, usável como duas armas. */
  dupla?: boolean;
  /**
   * Outros nomes pelos quais esta linha é procurada: o que ela já se chamou
   * aqui, e como outro livro da mesa a chama (o Guerreiro diz "cajado" onde o
   * Livro do Jogador diz "bordão"). Só para busca não quebrar.
   */
  apelidos?: string[];
};

export const ARMAS: ArmaModelo[] = [
  // ===== Armas simples =====
  // --- Ataque desarmado ---
  { nome: "Ataque desarmado", categoria: "Simples", manejo: "Desarmado", custo: "—", danoP: "1d2", dano: "1d3", critico: "×2", alcance: "", tipo: "Concussão", peso: null, naoLetal: true, apelidos: ["Desarmado"] },
  { nome: "Manopla", categoria: "Simples", manejo: "Desarmado", custo: "2 PO", danoP: "1d2", dano: "1d3", critico: "×2", alcance: "", tipo: "Concussão", peso: 0.5 },

  // --- Leves, corpo a corpo ---
  { nome: "Adaga de soco", categoria: "Simples", manejo: "Leve", custo: "2 PO", danoP: "1d3", dano: "1d4", critico: "×3", alcance: "", tipo: "Perfurante", peso: 0.5 },
  { nome: "Adaga", categoria: "Simples", manejo: "Leve", custo: "2 PO", danoP: "1d3", dano: "1d4", critico: "19-20/×2", alcance: "3 m", tipo: "Perfurante ou cortante", peso: 0.5 },
  // Tipo corrigido; ver o cabeçalho.
  { nome: "Foice curta", categoria: "Simples", manejo: "Leve", custo: "6 PO", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "", tipo: "Cortante", peso: 1 },
  { nome: "Maça leve", categoria: "Simples", manejo: "Leve", custo: "5 PO", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "", tipo: "Concussão", peso: 2 },
  { nome: "Manopla com cravos", categoria: "Simples", manejo: "Leve", custo: "5 PO", danoP: "1d3", dano: "1d4", critico: "×2", alcance: "", tipo: "Perfurante", peso: 0.5 },

  // --- Uma mão, corpo a corpo ---
  { nome: "Clava", categoria: "Simples", manejo: "Uma mão", custo: "—", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "3 m", tipo: "Concussão", peso: 1.5 },
  { nome: "Lança curta", categoria: "Simples", manejo: "Uma mão", custo: "1 PO", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "6 m", tipo: "Perfurante", peso: 1.5 },
  { nome: "Maça pesada", categoria: "Simples", manejo: "Uma mão", custo: "12 PO", danoP: "1d6", dano: "1d8", critico: "×2", alcance: "", tipo: "Concussão", peso: 4 },
  { nome: "Maça-estrela", categoria: "Simples", manejo: "Uma mão", custo: "8 PO", danoP: "1d6", dano: "1d8", critico: "×2", alcance: "", tipo: "Concussão e perfurante", peso: 3 },

  // --- Duas mãos, corpo a corpo ---
  { nome: "Bordão", categoria: "Simples", manejo: "Duas mãos", custo: "—", danoP: "1d4/1d4", dano: "1d6/1d6", critico: "×2", alcance: "", tipo: "Concussão", peso: 2, dupla: true, apelidos: ["Cajado"] },
  { nome: "Lança", categoria: "Simples", manejo: "Duas mãos", custo: "2 PO", danoP: "1d6", dano: "1d8", critico: "×3", alcance: "6 m", tipo: "Perfurante", peso: 3 },
  { nome: "Lança longa", categoria: "Simples", manejo: "Duas mãos", custo: "5 PO", danoP: "1d6", dano: "1d8", critico: "×3", alcance: "", tipo: "Perfurante", peso: 4.5, haste: true },

  // --- Ataque à distância ---
  { nome: "Azagaia", categoria: "Simples", manejo: "Distância", custo: "1 PO", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "9 m", tipo: "Perfurante", peso: 1 },
  { nome: "Besta leve", categoria: "Simples", manejo: "Distância", custo: "35 PO", danoP: "1d6", dano: "1d8", critico: "19-20/×2", alcance: "24 m", tipo: "Perfurante", peso: 2 },
  { nome: "Besta pesada", categoria: "Simples", manejo: "Distância", custo: "50 PO", danoP: "1d8", dano: "1d10", critico: "19-20/×2", alcance: "36 m", tipo: "Perfurante", peso: 4 },
  { nome: "Dardo", categoria: "Simples", manejo: "Distância", custo: "5 PP", danoP: "1d3", dano: "1d4", critico: "×2", alcance: "6 m", tipo: "Perfurante", peso: 0.25 },
  { nome: "Funda", categoria: "Simples", manejo: "Distância", custo: "—", danoP: "1d3", dano: "1d4", critico: "×2", alcance: "15 m", tipo: "Concussão", peso: 0 },

  // ===== Armas comuns =====
  // --- Leves, corpo a corpo ---
  { nome: "Armaduras com cravos", categoria: "Comum", manejo: "Leve", custo: "especial", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "", tipo: "Perfurante", peso: null },
  { nome: "Escudo pequeno", categoria: "Comum", manejo: "Leve", custo: "especial", danoP: "1d2", dano: "1d3", critico: "×2", alcance: "", tipo: "Concussão", peso: null },
  { nome: "Escudo pequeno com cravos", categoria: "Comum", manejo: "Leve", custo: "especial", danoP: "1d3", dano: "1d4", critico: "×2", alcance: "", tipo: "Perfurante", peso: null },
  { nome: "Espada curta", categoria: "Comum", manejo: "Leve", custo: "10 PO", danoP: "1d4", dano: "1d6", critico: "19-20/×2", alcance: "", tipo: "Perfurante", peso: 1 },
  { nome: "Kukri", categoria: "Comum", manejo: "Leve", custo: "8 PO", danoP: "1d3", dano: "1d4", critico: "18-20/×2", alcance: "", tipo: "Cortante", peso: 1 },
  { nome: "Machadinha", categoria: "Comum", manejo: "Leve", custo: "6 PO", danoP: "1d4", dano: "1d6", critico: "×3", alcance: "", tipo: "Cortante", peso: 1.5 },
  { nome: "Machado de arremesso", categoria: "Comum", manejo: "Leve", custo: "8 PO", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "3 m", tipo: "Cortante", peso: 1 },
  { nome: "Martelo leve", categoria: "Comum", manejo: "Leve", custo: "1 PO", danoP: "1d3", dano: "1d4", critico: "×2", alcance: "6 m", tipo: "Concussão", peso: 1 },
  { nome: "Picareta leve", categoria: "Comum", manejo: "Leve", custo: "4 PO", danoP: "1d3", dano: "1d4", critico: "×4", alcance: "", tipo: "Perfurante", peso: 1.5 },
  { nome: "Porrete", categoria: "Comum", manejo: "Leve", custo: "1 PO", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "", tipo: "Concussão", peso: 1, naoLetal: true },

  // --- Uma mão, corpo a corpo ---
  { nome: "Cimitarra", categoria: "Comum", manejo: "Uma mão", custo: "15 PO", danoP: "1d4", dano: "1d6", critico: "18-20/×2", alcance: "", tipo: "Cortante", peso: 2 },
  { nome: "Escudo grande", categoria: "Comum", manejo: "Uma mão", custo: "especial", danoP: "1d3", dano: "1d4", critico: "×2", alcance: "", tipo: "Concussão", peso: null },
  { nome: "Escudo grande com cravos", categoria: "Comum", manejo: "Uma mão", custo: "especial", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "", tipo: "Perfurante", peso: null },
  { nome: "Espada longa", categoria: "Comum", manejo: "Uma mão", custo: "15 PO", danoP: "1d6", dano: "1d8", critico: "19-20/×2", alcance: "", tipo: "Cortante", peso: 2 },
  { nome: "Machado de batalha", categoria: "Comum", manejo: "Uma mão", custo: "10 PO", danoP: "1d6", dano: "1d8", critico: "×3", alcance: "", tipo: "Cortante", peso: 3 },
  { nome: "Mangual", categoria: "Comum", manejo: "Uma mão", custo: "8 PO", danoP: "1d6", dano: "1d8", critico: "×2", alcance: "", tipo: "Concussão", peso: 2.5 },
  { nome: "Martelo de guerra", categoria: "Comum", manejo: "Uma mão", custo: "12 PO", danoP: "1d6", dano: "1d8", critico: "×3", alcance: "", tipo: "Concussão", peso: 2.5, apelidos: ["Malho"] },
  { nome: "Picareta pesada", categoria: "Comum", manejo: "Uma mão", custo: "8 PO", danoP: "1d4", dano: "1d6", critico: "×4", alcance: "", tipo: "Perfurante", peso: 3 },
  { nome: "Sabre", categoria: "Comum", manejo: "Uma mão", custo: "20 PO", danoP: "1d4", dano: "1d6", critico: "18-20/×2", alcance: "", tipo: "Perfurante", peso: 1, apelidos: ["Rapieira"] },
  { nome: "Tridente", categoria: "Comum", manejo: "Uma mão", custo: "15 PO", danoP: "1d6", dano: "1d8", critico: "×2", alcance: "3 m", tipo: "Perfurante", peso: 2 },

  // --- Duas mãos, corpo a corpo ---
  { nome: "Alabarda", categoria: "Comum", manejo: "Duas mãos", custo: "10 PO", danoP: "1d8", dano: "1d10", critico: "×3", alcance: "", tipo: "Perfurante ou cortante", peso: 6, haste: true },
  { nome: "Clava grande", categoria: "Comum", manejo: "Duas mãos", custo: "5 PO", danoP: "1d8", dano: "1d10", critico: "×2", alcance: "", tipo: "Concussão", peso: 4, apelidos: ["Marreta"] },
  { nome: "Espada larga", categoria: "Comum", manejo: "Duas mãos", custo: "50 PO", danoP: "1d10", dano: "2d6", critico: "19-20/×2", alcance: "", tipo: "Cortante", peso: 4, apelidos: ["Montante"] },
  { nome: "Falcione", categoria: "Comum", manejo: "Duas mãos", custo: "75 PO", danoP: "1d6", dano: "2d4", critico: "18-20/×2", alcance: "", tipo: "Cortante", peso: 4 },
  { nome: "Foice longa", categoria: "Comum", manejo: "Duas mãos", custo: "18 PO", danoP: "1d6", dano: "2d4", critico: "×4", alcance: "", tipo: "Perfurante ou cortante", peso: 5, apelidos: ["Gadanho"] },
  { nome: "Glaive", categoria: "Comum", manejo: "Duas mãos", custo: "8 PO", danoP: "1d8", dano: "1d10", critico: "×3", alcance: "", tipo: "Cortante", peso: 5, haste: true },
  { nome: "Guisarme", categoria: "Comum", manejo: "Duas mãos", custo: "9 PO", danoP: "1d6", dano: "2d4", critico: "×3", alcance: "", tipo: "Cortante", peso: 6, haste: true },
  { nome: "Lança montada", categoria: "Comum", manejo: "Duas mãos", custo: "10 PO", danoP: "1d6", dano: "1d8", critico: "×3", alcance: "", tipo: "Perfurante", peso: 5, haste: true },
  { nome: "Machado grande", categoria: "Comum", manejo: "Duas mãos", custo: "20 PO", danoP: "1d10", dano: "1d12", critico: "×3", alcance: "", tipo: "Cortante", peso: 6 },
  { nome: "Mangual pesado", categoria: "Comum", manejo: "Duas mãos", custo: "15 PO", danoP: "1d8", dano: "1d10", critico: "19-20/×2", alcance: "", tipo: "Concussão", peso: 5 },
  { nome: "Ranseur", categoria: "Comum", manejo: "Duas mãos", custo: "10 PO", danoP: "1d6", dano: "2d4", critico: "×3", alcance: "", tipo: "Perfurante", peso: 6, haste: true },

  // --- Ataque à distância ---
  { nome: "Arco curto", categoria: "Comum", manejo: "Distância", custo: "30 PO", danoP: "1d4", dano: "1d6", critico: "×3", alcance: "18 m", tipo: "Perfurante", peso: 1 },
  { nome: "Arco curto composto", categoria: "Comum", manejo: "Distância", custo: "75 PO", danoP: "1d4", dano: "1d6", critico: "×3", alcance: "21 m", tipo: "Perfurante", peso: 1 },
  { nome: "Arco longo", categoria: "Comum", manejo: "Distância", custo: "75 PO", danoP: "1d6", dano: "1d8", critico: "×3", alcance: "30 m", tipo: "Perfurante", peso: 1.5 },
  { nome: "Arco longo composto", categoria: "Comum", manejo: "Distância", custo: "100 PO", danoP: "1d6", dano: "1d8", critico: "×3", alcance: "33 m", tipo: "Perfurante", peso: 1.5 },

  // ===== Armas exóticas =====
  // --- Leves, corpo a corpo ---
  { nome: "Kama", categoria: "Exótica", manejo: "Leve", custo: "2 PO", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "", tipo: "Cortante", peso: 1 },
  { nome: "Nunchaku", categoria: "Exótica", manejo: "Leve", custo: "2 PO", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "", tipo: "Concussão", peso: 1 },
  { nome: "Sai", categoria: "Exótica", manejo: "Leve", custo: "1 PO", danoP: "1d3", dano: "1d4", critico: "×2", alcance: "3 m", tipo: "Concussão", peso: 0.5 },
  { nome: "Siangham", categoria: "Exótica", manejo: "Leve", custo: "3 PO", danoP: "1d4", dano: "1d6", critico: "×2", alcance: "", tipo: "Perfurante", peso: 0.5 },

  // --- Uma mão, corpo a corpo ---
  { nome: "Chicote", categoria: "Exótica", manejo: "Uma mão", custo: "1 PO", danoP: "1d2", dano: "1d3", critico: "×2", alcance: "", tipo: "Cortante", peso: 1, naoLetal: true, haste: true },
  { nome: "Espada bastarda", categoria: "Exótica", manejo: "Uma mão", custo: "35 PO", danoP: "1d8", dano: "1d10", critico: "19-20/×2", alcance: "", tipo: "Cortante", peso: 3 },
  { nome: "Machado de guerra anão", categoria: "Exótica", manejo: "Uma mão", custo: "30 PO", danoP: "1d8", dano: "1d10", critico: "×3", alcance: "", tipo: "Cortante", peso: 4, apelidos: ["Machado anão de guerra", "Machado de guerra dos anões"] },

  // --- Duas mãos, corpo a corpo ---
  { nome: "Corrente com cravos", categoria: "Exótica", manejo: "Duas mãos", custo: "25 PO", danoP: "1d6", dano: "2d4", critico: "×2", alcance: "", tipo: "Perfurante", peso: 5, haste: true },
  { nome: "Espada de duas lâminas", categoria: "Exótica", manejo: "Duas mãos", custo: "100 PO", danoP: "1d6/1d6", dano: "1d8/1d8", critico: "19-20/×2", alcance: "", tipo: "Cortante", peso: 5, dupla: true, apelidos: ["Espada dupla élfica"] },
  { nome: "Machado orc duplo", categoria: "Exótica", manejo: "Duas mãos", custo: "60 PO", danoP: "1d6/1d6", dano: "1d8/1d8", critico: "×3", alcance: "", tipo: "Cortante", peso: 7.5, dupla: true },
  { nome: "Mangual atroz", categoria: "Exótica", manejo: "Duas mãos", custo: "90 PO", danoP: "1d6/1d6", dano: "1d8/1d8", critico: "×2", alcance: "", tipo: "Concussão", peso: 5, dupla: true, apelidos: ["Mangual duplo orc"] },
  { nome: "Martelo gnomo com gancho", categoria: "Exótica", manejo: "Duas mãos", custo: "20 PO", danoP: "1d6/1d4", dano: "1d8/1d6", critico: "×3/×4", alcance: "", tipo: "Concussão e perfurante", peso: 3, dupla: true },
  { nome: "Urgrosh anão", categoria: "Exótica", manejo: "Duas mãos", custo: "50 PO", danoP: "1d6/1d4", dano: "1d8/1d6", critico: "×3", alcance: "", tipo: "Cortante ou perfurante", peso: 6, dupla: true },

  // --- Ataque à distância ---
  { nome: "Besta leve de repetição", categoria: "Exótica", manejo: "Distância", custo: "250 PO", danoP: "1d6", dano: "1d8", critico: "19-20/×2", alcance: "24 m", tipo: "Perfurante", peso: 3, apelidos: ["Besta de repetição"] },
  { nome: "Besta pesada de repetição", categoria: "Exótica", manejo: "Distância", custo: "400 PO", danoP: "1d8", dano: "1d10", critico: "19-20/×2", alcance: "36 m", tipo: "Perfurante", peso: 6 },
  { nome: "Besta de mão", categoria: "Exótica", manejo: "Distância", custo: "100 PO", danoP: "1d3", dano: "1d4", critico: "19-20/×2", alcance: "9 m", tipo: "Perfurante", peso: 1 },
  { nome: "Boleadeira", categoria: "Exótica", manejo: "Distância", custo: "5 PO", danoP: "1d3", dano: "1d4", critico: "×2", alcance: "3 m", tipo: "Concussão", peso: 1, naoLetal: true },
  { nome: "Rede", categoria: "Exótica", manejo: "Distância", custo: "20 PO", danoP: "—", dano: "—", critico: "—", alcance: "3 m", tipo: "—", peso: 3 },
  { nome: "Shuriken", categoria: "Exótica", manejo: "Distância", custo: "1 PO", danoP: "1", dano: "1d2", critico: "×2", alcance: "3 m", tipo: "Perfurante", peso: 0.25 },
];

const acha = <T extends { nome: string; apelidos?: string[] }>(
  lista: T[],
  nome: string,
): T | undefined =>
  lista.find((x) => x.nome === nome) ??
  lista.find((x) => x.apelidos?.includes(nome));

/** Acha pelo nome de hoje ou por um nome antigo (`apelidos`). */
export function armaduraPor(nome: string): ArmaduraModelo | undefined {
  return acha(ARMADURAS, nome);
}

/** Acha pelo nome de hoje ou por um nome antigo (`apelidos`). */
export function armaPor(nome: string): ArmaModelo | undefined {
  return acha(ARMAS, nome);
}

/** Equipamento de aventura comum, para o autocomplete da mochila. */
export const ITENS_COMUNS: { nome: string; peso: number }[] = [
  { nome: "Mochila", peso: 1 },
  { nome: "Saco de dormir", peso: 2.5 },
  { nome: "Corda de cânhamo (15 m)", peso: 5 },
  { nome: "Corda de seda (15 m)", peso: 2.5 },
  { nome: "Tocha", peso: 0.5 },
  { nome: "Lampião", peso: 1 },
  { nome: "Óleo (frasco)", peso: 0.5 },
  { nome: "Ração de viagem (1 dia)", peso: 0.5 },
  { nome: "Odre", peso: 2 },
  { nome: "Kit de primeiros socorros", peso: 0.5 },
  { nome: "Ferramentas de ladrão", peso: 0.5 },
  { nome: "Pé de cabra", peso: 2.5 },
  { nome: "Martelo", peso: 1 },
  { nome: "Pitons (10)", peso: 2.5 },
  { nome: "Gancho de escalada", peso: 2 },
  { nome: "Espelho de aço", peso: 0.25 },
  { nome: "Pergaminho em branco", peso: 0 },
  { nome: "Tinta e pena", peso: 0 },
  { nome: "Símbolo sagrado de madeira", peso: 0 },
  { nome: "Símbolo sagrado de prata", peso: 0.5 },
  { nome: "Componentes de magia (bolsa)", peso: 1 },
  { nome: "Poção de Curar Ferimentos Leves", peso: 0 },
  { nome: "Água benta (frasco)", peso: 0.5 },
  { nome: "Fogo alquímico (frasco)", peso: 0.5 },
  { nome: "Vara de 3 m", peso: 4 },
  { nome: "Rede de caça", peso: 3 },
  { nome: "Algemas", peso: 1 },
  { nome: "Vestimenta de viajante", peso: 2.5 },
  // Munição, das sublinhas da Tabela 7-5.
  { nome: "Flechas (20)", peso: 1.5 },
  { nome: "Virotes de besta", peso: 0.5 },
  { nome: "Balas de funda", peso: 2.5 },
];
