// Tabelas de armas e armaduras do SRD 3.5.
//
// Valores para criatura de tamanho Médio. Pesos em quilos, na conversão
// métrica usual (1 lb = 0,5 kg); alcances em metros, como nas edições
// brasileiras. Tudo que é preenchido a partir daqui continua editável na ficha.

export type ArmaduraModelo = {
  nome: string;
  categoria: "Leve" | "Média" | "Pesada" | "Escudo";
  bonusCa: number;
  /** null = sem limite (escudos não limitam Destreza). */
  desMax: number | null;
  penalidade: number;
  falhaMagia: number;
  deslocamento: string;
  peso: number;
};

export const ARMADURAS: ArmaduraModelo[] = [
  // Leves
  { nome: "Acolchoada", categoria: "Leve", bonusCa: 1, desMax: 8, penalidade: 0, falhaMagia: 5, deslocamento: "9 m", peso: 5 },
  { nome: "Couro", categoria: "Leve", bonusCa: 2, desMax: 6, penalidade: 0, falhaMagia: 10, deslocamento: "9 m", peso: 7.5 },
  { nome: "Couro batido", categoria: "Leve", bonusCa: 3, desMax: 5, penalidade: -1, falhaMagia: 15, deslocamento: "9 m", peso: 10 },
  { nome: "Camisão de malha", categoria: "Leve", bonusCa: 4, desMax: 4, penalidade: -2, falhaMagia: 20, deslocamento: "9 m", peso: 12.5 },
  // Médias
  { nome: "Gibão de peles", categoria: "Média", bonusCa: 3, desMax: 4, penalidade: -3, falhaMagia: 20, deslocamento: "6 m", peso: 12.5 },
  { nome: "Brunea", categoria: "Média", bonusCa: 4, desMax: 3, penalidade: -4, falhaMagia: 25, deslocamento: "6 m", peso: 15 },
  { nome: "Cota de malha", categoria: "Média", bonusCa: 5, desMax: 2, penalidade: -5, falhaMagia: 30, deslocamento: "6 m", peso: 20 },
  { nome: "Peitoral", categoria: "Média", bonusCa: 5, desMax: 3, penalidade: -4, falhaMagia: 25, deslocamento: "6 m", peso: 15 },
  // Pesadas
  { nome: "Meia-armadura", categoria: "Pesada", bonusCa: 6, desMax: 1, penalidade: -6, falhaMagia: 35, deslocamento: "6 m", peso: 17.5 },
  { nome: "Cota de talas", categoria: "Pesada", bonusCa: 6, desMax: 0, penalidade: -7, falhaMagia: 40, deslocamento: "6 m", peso: 22.5 },
  { nome: "Placas parciais", categoria: "Pesada", bonusCa: 7, desMax: 0, penalidade: -7, falhaMagia: 40, deslocamento: "6 m", peso: 25 },
  { nome: "Armadura completa", categoria: "Pesada", bonusCa: 8, desMax: 1, penalidade: -6, falhaMagia: 35, deslocamento: "6 m", peso: 25 },
  // Escudos
  { nome: "Broquel", categoria: "Escudo", bonusCa: 1, desMax: null, penalidade: -1, falhaMagia: 5, deslocamento: "", peso: 2.5 },
  { nome: "Escudo leve de madeira", categoria: "Escudo", bonusCa: 1, desMax: null, penalidade: -1, falhaMagia: 5, deslocamento: "", peso: 2.5 },
  { nome: "Escudo leve de aço", categoria: "Escudo", bonusCa: 1, desMax: null, penalidade: -1, falhaMagia: 5, deslocamento: "", peso: 3 },
  { nome: "Escudo pesado de madeira", categoria: "Escudo", bonusCa: 2, desMax: null, penalidade: -2, falhaMagia: 15, deslocamento: "", peso: 5 },
  { nome: "Escudo pesado de aço", categoria: "Escudo", bonusCa: 2, desMax: null, penalidade: -2, falhaMagia: 15, deslocamento: "", peso: 7.5 },
  { nome: "Escudo corporal", categoria: "Escudo", bonusCa: 4, desMax: 2, penalidade: -10, falhaMagia: 50, deslocamento: "", peso: 22.5 },
];

export function armaduraPor(nome: string): ArmaduraModelo | undefined {
  return ARMADURAS.find((a) => a.nome === nome);
}

export type ArmaModelo = {
  nome: string;
  categoria: "Simples" | "Marcial" | "Exótica";
  dano: string;
  critico: string;
  /** Vazio = corpo a corpo. */
  alcance: string;
  tipo: string;
  peso: number;
};

export const ARMAS: ArmaModelo[] = [
  // Simples
  { nome: "Adaga", categoria: "Simples", dano: "1d4", critico: "19-20/×2", alcance: "3 m", tipo: "Perfurante ou cortante", peso: 0.5 },
  { nome: "Azagaia", categoria: "Simples", dano: "1d6", critico: "×2", alcance: "9 m", tipo: "Perfurante", peso: 1 },
  { nome: "Bordão", categoria: "Simples", dano: "1d6/1d6", critico: "×2", alcance: "", tipo: "Contundente", peso: 2 },
  { nome: "Besta leve", categoria: "Simples", dano: "1d8", critico: "19-20/×2", alcance: "24 m", tipo: "Perfurante", peso: 2 },
  { nome: "Besta pesada", categoria: "Simples", dano: "1d10", critico: "19-20/×2", alcance: "36 m", tipo: "Perfurante", peso: 4 },
  { nome: "Clava", categoria: "Simples", dano: "1d6", critico: "×2", alcance: "3 m", tipo: "Contundente", peso: 1.5 },
  { nome: "Dardo", categoria: "Simples", dano: "1d4", critico: "×2", alcance: "6 m", tipo: "Perfurante", peso: 0.25 },
  { nome: "Foice curta", categoria: "Simples", dano: "1d6", critico: "×2", alcance: "", tipo: "Cortante", peso: 1 },
  { nome: "Funda", categoria: "Simples", dano: "1d4", critico: "×2", alcance: "15 m", tipo: "Contundente", peso: 0 },
  { nome: "Lança curta", categoria: "Simples", dano: "1d6", critico: "×2", alcance: "6 m", tipo: "Perfurante", peso: 1.5 },
  { nome: "Lança longa", categoria: "Simples", dano: "1d8", critico: "×3", alcance: "", tipo: "Perfurante", peso: 4.5 },
  { nome: "Maça leve", categoria: "Simples", dano: "1d6", critico: "×2", alcance: "", tipo: "Contundente", peso: 2 },
  { nome: "Maça pesada", categoria: "Simples", dano: "1d8", critico: "×2", alcance: "", tipo: "Contundente", peso: 4 },
  { nome: "Desarmado", categoria: "Simples", dano: "1d3", critico: "×2", alcance: "", tipo: "Contundente (não-letal)", peso: 0 },

  // Marciais
  { nome: "Alabarda", categoria: "Marcial", dano: "1d10", critico: "×3", alcance: "", tipo: "Cortante ou perfurante", peso: 6 },
  { nome: "Arco curto", categoria: "Marcial", dano: "1d6", critico: "×3", alcance: "18 m", tipo: "Perfurante", peso: 1 },
  { nome: "Arco curto composto", categoria: "Marcial", dano: "1d6", critico: "×3", alcance: "21 m", tipo: "Perfurante", peso: 1 },
  { nome: "Arco longo", categoria: "Marcial", dano: "1d8", critico: "×3", alcance: "30 m", tipo: "Perfurante", peso: 1.5 },
  { nome: "Arco longo composto", categoria: "Marcial", dano: "1d8", critico: "×3", alcance: "33 m", tipo: "Perfurante", peso: 1.5 },
  { nome: "Cimitarra", categoria: "Marcial", dano: "1d6", critico: "18-20/×2", alcance: "", tipo: "Cortante", peso: 2 },
  { nome: "Espada curta", categoria: "Marcial", dano: "1d6", critico: "19-20/×2", alcance: "", tipo: "Perfurante", peso: 1 },
  { nome: "Espada longa", categoria: "Marcial", dano: "1d8", critico: "19-20/×2", alcance: "", tipo: "Cortante", peso: 2 },
  { nome: "Gadanho", categoria: "Marcial", dano: "2d4", critico: "×4", alcance: "", tipo: "Cortante ou perfurante", peso: 5 },
  { nome: "Glaive", categoria: "Marcial", dano: "1d10", critico: "×3", alcance: "", tipo: "Cortante", peso: 5 },
  { nome: "Lança montada", categoria: "Marcial", dano: "1d8", critico: "×3", alcance: "", tipo: "Perfurante", peso: 5 },
  { nome: "Machadinha", categoria: "Marcial", dano: "1d6", critico: "×3", alcance: "3 m", tipo: "Cortante", peso: 1.5 },
  { nome: "Machado de batalha", categoria: "Marcial", dano: "1d8", critico: "×3", alcance: "", tipo: "Cortante", peso: 3 },
  { nome: "Machado grande", categoria: "Marcial", dano: "1d12", critico: "×3", alcance: "", tipo: "Cortante", peso: 6 },
  { nome: "Malho", categoria: "Marcial", dano: "1d8", critico: "×3", alcance: "", tipo: "Contundente", peso: 2.5 },
  { nome: "Mangual", categoria: "Marcial", dano: "1d8", critico: "×2", alcance: "", tipo: "Contundente", peso: 2.5 },
  { nome: "Mangual pesado", categoria: "Marcial", dano: "1d10", critico: "19-20/×2", alcance: "", tipo: "Contundente", peso: 5 },
  { nome: "Marreta", categoria: "Marcial", dano: "1d10", critico: "×2", alcance: "", tipo: "Contundente", peso: 4 },
  { nome: "Montante", categoria: "Marcial", dano: "2d6", critico: "19-20/×2", alcance: "", tipo: "Cortante", peso: 4 },
  { nome: "Picareta leve", categoria: "Marcial", dano: "1d4", critico: "×4", alcance: "", tipo: "Perfurante", peso: 1.5 },
  { nome: "Picareta pesada", categoria: "Marcial", dano: "1d6", critico: "×4", alcance: "", tipo: "Perfurante", peso: 3 },
  { nome: "Rapieira", categoria: "Marcial", dano: "1d6", critico: "18-20/×2", alcance: "", tipo: "Perfurante", peso: 1 },
  { nome: "Tridente", categoria: "Marcial", dano: "1d8", critico: "×2", alcance: "3 m", tipo: "Perfurante", peso: 2 },

  // Exóticas
  { nome: "Besta de mão", categoria: "Exótica", dano: "1d4", critico: "19-20/×2", alcance: "9 m", tipo: "Perfurante", peso: 1 },
  { nome: "Besta de repetição", categoria: "Exótica", dano: "1d8", critico: "19-20/×2", alcance: "24 m", tipo: "Perfurante", peso: 6 },
  { nome: "Chicote", categoria: "Exótica", dano: "1d3", critico: "×2", alcance: "", tipo: "Cortante (não-letal)", peso: 1 },
  { nome: "Corrente com cravos", categoria: "Exótica", dano: "2d4", critico: "×2", alcance: "", tipo: "Perfurante", peso: 5 },
  { nome: "Espada bastarda", categoria: "Exótica", dano: "1d10", critico: "19-20/×2", alcance: "", tipo: "Cortante", peso: 3 },
  { nome: "Espada dupla élfica", categoria: "Exótica", dano: "1d8/1d8", critico: "19-20/×2", alcance: "", tipo: "Cortante", peso: 7.5 },
  { nome: "Kama", categoria: "Exótica", dano: "1d6", critico: "×2", alcance: "", tipo: "Cortante", peso: 1 },
  { nome: "Machado anão de guerra", categoria: "Exótica", dano: "1d10", critico: "×3", alcance: "", tipo: "Cortante", peso: 3.5 },
  { nome: "Mangual duplo orc", categoria: "Exótica", dano: "1d8/1d8", critico: "×2", alcance: "", tipo: "Contundente", peso: 5 },
  { nome: "Nunchaku", categoria: "Exótica", dano: "1d6", critico: "×2", alcance: "", tipo: "Contundente", peso: 1 },
  { nome: "Rede", categoria: "Exótica", dano: "—", critico: "—", alcance: "3 m", tipo: "—", peso: 3 },
  { nome: "Sai", categoria: "Exótica", dano: "1d4", critico: "×2", alcance: "3 m", tipo: "Contundente", peso: 0.5 },
  { nome: "Shuriken", categoria: "Exótica", dano: "1d2", critico: "×2", alcance: "3 m", tipo: "Perfurante", peso: 0.25 },
  { nome: "Urgrosh anão", categoria: "Exótica", dano: "1d8/1d6", critico: "×3", alcance: "", tipo: "Cortante ou perfurante", peso: 6 },
];

export function armaPor(nome: string): ArmaModelo | undefined {
  return ARMAS.find((a) => a.nome === nome);
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
];
