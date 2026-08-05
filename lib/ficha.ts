// Modelo da ficha de personagem de D&D 3.5, fiel à ficha oficial.
//
// Princípio central: TUDO que a ficha oficial deriva de outros campos é
// calculado aqui automaticamente. Cada valor derivado aceita uma sobrescrita
// manual (`Override`), para quando a mesa usa regra da casa ou aparece um caso
// que a conta padrão não cobre. `null` = usar o cálculo.
//
// Os valores vivem no JSON da coluna `dados` (tabela Ficha), então acrescentar
// campo NÃO exige migração — só tratar a compatibilidade em `lerDados`.

/** Valor derivado com sobrescrita manual. `null` = usar o cálculo automático. */
// Caminho relativo (e não o alias "@/") para que os scripts de verificação
// consigam importar este módulo direto pelo Node, fora do resolvedor do Next.
import { bbaDaClasse, classePor, resistenciaBase } from "./dnd35/classes.ts";

export type Override = number | null;

export type ChaveAtributo =
  | "forca"
  | "destreza"
  | "constituicao"
  | "inteligencia"
  | "sabedoria"
  | "carisma";

export type Atributos = Record<ChaveAtributo, number | null>;

export const ATRIBUTOS: {
  chave: ChaveAtributo;
  rotulo: string;
  abrev: string;
}[] = [
  { chave: "forca", rotulo: "Força", abrev: "FOR" },
  { chave: "destreza", rotulo: "Destreza", abrev: "DES" },
  { chave: "constituicao", rotulo: "Constituição", abrev: "CON" },
  { chave: "inteligencia", rotulo: "Inteligência", abrev: "INT" },
  { chave: "sabedoria", rotulo: "Sabedoria", abrev: "SAB" },
  { chave: "carisma", rotulo: "Carisma", abrev: "CAR" },
];

export const ABREV_ATRIBUTO: Record<ChaveAtributo, string> = {
  forca: "FOR",
  destreza: "DES",
  constituicao: "CON",
  inteligencia: "INT",
  sabedoria: "SAB",
  carisma: "CAR",
};

export const ALINHAMENTOS = [
  "Leal e Bom",
  "Neutro e Bom",
  "Caótico e Bom",
  "Leal e Neutro",
  "Neutro",
  "Caótico e Neutro",
  "Leal e Mau",
  "Neutro e Mau",
  "Caótico e Mau",
] as const;

/**
 * Categorias de tamanho. O modificador de tamanho vale igual para CA e para
 * jogadas de ataque; agarrar usa o "modificador de tamanho especial", que é
 * outro (por isso as duas colunas).
 */
export const TAMANHOS: {
  id: string;
  nome: string;
  /** Modificador de tamanho para CA e ataque. */
  mod: number;
  /** Modificador de tamanho especial, usado em agarrar. */
  agarrar: number;
}[] = [
  { id: "miudo", nome: "Miúdo", mod: 8, agarrar: -16 },
  { id: "diminuto", nome: "Diminuto", mod: 4, agarrar: -12 },
  { id: "minusculo", nome: "Minúsculo", mod: 2, agarrar: -8 },
  { id: "pequeno", nome: "Pequeno", mod: 1, agarrar: -4 },
  { id: "medio", nome: "Médio", mod: 0, agarrar: 0 },
  { id: "grande", nome: "Grande", mod: -1, agarrar: 4 },
  { id: "enorme", nome: "Enorme", mod: -2, agarrar: 8 },
  { id: "imenso", nome: "Imenso", mod: -4, agarrar: 12 },
  { id: "colossal", nome: "Colossal", mod: -8, agarrar: 16 },
];

export function tamanhoPor(id: string) {
  return TAMANHOS.find((t) => t.id === id) ?? TAMANHOS[4]; // Médio como padrão
}

export const ESCOLAS_MAGIA = [
  "Abjuração",
  "Adivinhação",
  "Conjuração",
  "Encantamento",
  "Evocação",
  "Ilusão",
  "Necromancia",
  "Transmutação",
  "Universal",
] as const;

/**
 * Perícias do D&D 3.5 (SRD, nomes da tradução brasileira).
 *  - `semTreino`: usável com 0 graduações.
 *  - `armadura`: sofre a penalidade de armadura.
 *  - `dobraArmadura`: Natação sofre a penalidade em dobro.
 */
export const PERICIAS: {
  id: string;
  nome: string;
  atributo: ChaveAtributo;
  semTreino: boolean;
  armadura: boolean;
  dobraArmadura?: boolean;
}[] = [
  { id: "abrirFechaduras", nome: "Abrir Fechaduras", atributo: "destreza", semTreino: false, armadura: false },
  { id: "acrobacia", nome: "Acrobacia", atributo: "destreza", semTreino: false, armadura: true },
  { id: "adestrarAnimais", nome: "Adestrar Animais", atributo: "carisma", semTreino: false, armadura: false },
  { id: "arteDaFuga", nome: "Arte da Fuga", atributo: "destreza", semTreino: true, armadura: true },
  { id: "atuacao", nome: "Atuação", atributo: "carisma", semTreino: true, armadura: false },
  { id: "avaliacao", nome: "Avaliação", atributo: "inteligencia", semTreino: true, armadura: false },
  { id: "blefar", nome: "Blefar", atributo: "carisma", semTreino: true, armadura: false },
  { id: "cavalgar", nome: "Cavalgar", atributo: "destreza", semTreino: true, armadura: false },
  { id: "concentracao", nome: "Concentração", atributo: "constituicao", semTreino: true, armadura: false },
  { id: "conhecimento", nome: "Conhecimento", atributo: "inteligencia", semTreino: false, armadura: false },
  { id: "cura", nome: "Cura", atributo: "sabedoria", semTreino: true, armadura: false },
  { id: "decifrarEscrita", nome: "Decifrar Escrita", atributo: "inteligencia", semTreino: false, armadura: false },
  { id: "diplomacia", nome: "Diplomacia", atributo: "carisma", semTreino: true, armadura: false },
  { id: "disfarce", nome: "Disfarce", atributo: "carisma", semTreino: true, armadura: false },
  { id: "equilibrio", nome: "Equilíbrio", atributo: "destreza", semTreino: true, armadura: true },
  { id: "escalar", nome: "Escalar", atributo: "forca", semTreino: true, armadura: true },
  { id: "esconderSe", nome: "Esconder-se", atributo: "destreza", semTreino: true, armadura: true },
  { id: "falsificacao", nome: "Falsificação", atributo: "inteligencia", semTreino: true, armadura: false },
  { id: "furtividade", nome: "Furtividade", atributo: "destreza", semTreino: true, armadura: true },
  { id: "identificarMagia", nome: "Identificar Magia", atributo: "inteligencia", semTreino: false, armadura: false },
  { id: "intimidar", nome: "Intimidar", atributo: "carisma", semTreino: true, armadura: false },
  { id: "natacao", nome: "Natação", atributo: "forca", semTreino: true, armadura: true, dobraArmadura: true },
  { id: "obterInformacao", nome: "Obter Informação", atributo: "carisma", semTreino: true, armadura: false },
  { id: "observar", nome: "Observar", atributo: "sabedoria", semTreino: true, armadura: false },
  { id: "oficio", nome: "Ofício", atributo: "inteligencia", semTreino: true, armadura: false },
  { id: "operarMecanismo", nome: "Operar Mecanismo", atributo: "destreza", semTreino: false, armadura: false },
  { id: "ouvir", nome: "Ouvir", atributo: "sabedoria", semTreino: true, armadura: false },
  { id: "prestidigitacao", nome: "Prestidigitação", atributo: "destreza", semTreino: false, armadura: true },
  { id: "procurar", nome: "Procurar", atributo: "inteligencia", semTreino: true, armadura: false },
  { id: "profissao", nome: "Profissão", atributo: "sabedoria", semTreino: false, armadura: false },
  { id: "saltar", nome: "Saltar", atributo: "forca", semTreino: true, armadura: true },
  { id: "sentirMotivacao", nome: "Sentir Motivação", atributo: "sabedoria", semTreino: true, armadura: false },
  { id: "sobrevivencia", nome: "Sobrevivência", atributo: "sabedoria", semTreino: true, armadura: false },
  { id: "usarCordas", nome: "Usar Cordas", atributo: "destreza", semTreino: true, armadura: false },
  { id: "usarInstrumentoMagico", nome: "Usar Instrumento Mágico", atributo: "carisma", semTreino: false, armadura: false },
];

export function periciaPor(id: string) {
  return PERICIAS.find((p) => p.id === id);
}

// ---------------------------------------------------------------------------
// Estruturas da ficha
// ---------------------------------------------------------------------------

export type PericiaFicha = {
  ranks: number | null;
  misc: number | null;
  /** Perícia de classe (custo 1 ponto por graduação, em vez de 2). */
  classe: boolean;
};

export type Arma = {
  nome: string;
  /** Vazio = usar o ataque corpo-a-corpo/à distância calculado. */
  bonus: string;
  dano: string;
  critico: string;
  alcance: string;
  tipo: string;
  municao: string;
  notas: string;
};

export type Armadura = {
  nome: string;
  tipo: string;
  bonusCa: number | null;
  desMax: number | null;
  penalidade: number | null;
  falhaMagia: number | null;
  deslocamento: string;
  peso: number | null;
};

export type Talento = { nome: string; notas: string };
export type HabilidadeEspecial = { nome: string; notas: string };
export type Item = { nome: string; qtd: number | null; peso: number | null; notas: string };

export type Magia = {
  nome: string;
  nivel: string;
  escola: string;
  preparadas: string;
  notas: string;
};

/** Linha da tabela de magias, um por nível de magia (0 a 9). */
export type NivelMagia = {
  conhecidas: string;
  porDia: string;
  /** CD de resistência. Vazio = 10 + nível + mod. do atributo-chave. */
  cd: Override;
};

export type Dinheiro = {
  pl: number | null;
  po: number | null;
  pp: number | null;
  pc: number | null;
};

/** Uma classe do personagem. Multiclasse é só ter mais de uma linha. */
export type ClasseNivel = {
  /** Id de CLASSES em lib/dnd35/classes.ts, ou texto livre para classes de fora. */
  classe: string;
  nivel: number | null;
};

export type DadosFicha = {
  // --- Identidade ---
  jogador: string;
  /** Texto livre, mantido para fichas antigas e classes fora do núcleo. */
  classeNivel: string;
  /** Estruturado: alimenta BBA, resistências-base e perícias de classe. */
  classes: ClasseNivel[];
  /** Id de RACAS, ou vazio. */
  racaId: string;
  raca: string;
  alinhamento: string;
  divindade: string;
  tamanho: string;
  idade: string;
  sexo: string;
  altura: string;
  peso: string;
  olhos: string;
  cabelo: string;
  pele: string;
  xpAtual: number | null;
  xpProximo: number | null;

  // --- Atributos ---
  atributos: Atributos;
  /** Valores temporários (buff/debuff). Vazio = sem alteração. */
  atributosTemp: Atributos;

  // --- Pontos de vida ---
  /**
   * PV rolado em cada nível — índice 0 é o 1º nível. Guardar por nível (e não
   * só o total) importa no multiclasse, onde cada classe rola um dado
   * diferente, e preserva o histórico das rolagens.
   */
  pvNiveis: (number | null)[];
  /** Vazio = soma dos níveis + mod. de Constituição por nível. */
  pvMax: Override;
  pvAtual: number | null;
  danoNaoLetal: number | null;
  reducaoDano: string;

  // --- Classe de armadura (componentes; o total é calculado) ---
  caArmadura: number | null;
  caEscudo: number | null;
  caNatural: number | null;
  caDeflexao: number | null;
  caMisc: number | null;
  /** Sobrescritas dos três totais de CA. */
  caTotal: Override;
  caToque: Override;
  caDesprevenido: Override;

  // --- Iniciativa e deslocamento ---
  iniciativaMisc: number | null;
  iniciativaTotal: Override;
  deslocamento: string;

  // --- Testes de resistência (componentes; o total é calculado) ---
  fortBase: number | null;
  fortMagico: number | null;
  fortMisc: number | null;
  fortTotal: Override;
  refBase: number | null;
  refMagico: number | null;
  refMisc: number | null;
  refTotal: Override;
  vonBase: number | null;
  vonMagico: number | null;
  vonMisc: number | null;
  vonTotal: Override;

  // --- Ataque ---
  bba: string;
  ataqueCorpoMisc: number | null;
  ataqueCorpoTotal: Override;
  ataqueDistanciaMisc: number | null;
  ataqueDistanciaTotal: Override;
  agarrarMisc: number | null;
  agarrarTotal: Override;
  armas: Arma[];

  // --- Armaduras e escudos ---
  armaduras: Armadura[];
  /** Vazio = somar as penalidades das armaduras equipadas. */
  penalidadeArmadura: Override;
  falhaMagiaTotal: Override;

  // --- Perícias ---
  pericias: Record<string, PericiaFicha>;

  // --- Talentos, habilidades, idiomas ---
  talentos: Talento[];
  habilidades: HabilidadeEspecial[];
  idiomas: string;

  // --- Equipamento e carga ---
  equipamento: Item[];
  dinheiro: Dinheiro;
  /** Vazio = somar o peso dos itens (mais o das moedas). */
  pesoTotal: Override;
  cargaLeve: Override;
  cargaMedia: Override;
  cargaPesada: Override;

  // --- Conjuração ---
  conjuracaoClasse: string;
  conjuracaoAtributo: string;
  /** Índice 0 a 9. */
  magiasPorNivel: NivelMagia[];
  magias: Magia[];

  /**
   * Campo herdado de uma versão anterior da ficha, cuja semântica se perdeu.
   * Guardado intacto para não destruir dado de ninguém — quando alguém
   * lembrar o que é, vira um campo de verdade.
   */
  periciasExtras: unknown[];
};

// ---------------------------------------------------------------------------
// Cálculos
// ---------------------------------------------------------------------------

/** Modificador de atributo: floor((valor − 10) / 2). */
export function modificador(valor: number | null | undefined): number {
  if (valor == null || Number.isNaN(valor)) return 0;
  return Math.floor((valor - 10) / 2);
}

export function formatarMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function n(v: number | null | undefined): number {
  return v == null || Number.isNaN(v) ? 0 : v;
}

/**
 * Atributo em vigor: o temporário quando preenchido, senão o normal.
 * A ficha oficial tem as duas colunas justamente para buffs e debuffs.
 */
export function atributoEmVigor(dados: DadosFicha, chave: ChaveAtributo): number | null {
  const temp = dados.atributosTemp[chave];
  return temp != null ? temp : dados.atributos[chave];
}

export function modAtributo(dados: DadosFicha, chave: ChaveAtributo): number {
  return modificador(atributoEmVigor(dados, chave));
}

/** Penalidade de armadura somada das peças equipadas (número ≤ 0). */
export function penalidadeArmaduraAuto(dados: DadosFicha): number {
  return dados.armaduras.reduce((s, a) => s - Math.abs(n(a.penalidade)), 0);
}

export function penalidadeArmadura(dados: DadosFicha): number {
  return dados.penalidadeArmadura ?? penalidadeArmaduraAuto(dados);
}

export function falhaMagiaAuto(dados: DadosFicha): number {
  return dados.armaduras.reduce((s, a) => s + n(a.falhaMagia), 0);
}

/**
 * Bônus de Destreza aplicado à CA. A armadura limita pelo "DES máx" — quando
 * há mais de uma peça com limite, vale a menor.
 */
export function desAplicadaCa(dados: DadosFicha): number {
  const mod = modAtributo(dados, "destreza");
  const limites = dados.armaduras
    .map((a) => a.desMax)
    .filter((x): x is number => x != null);
  if (limites.length === 0) return mod;
  return Math.min(mod, Math.min(...limites));
}

export function caTotalAuto(dados: DadosFicha): number {
  return (
    10 +
    n(dados.caArmadura) +
    n(dados.caEscudo) +
    desAplicadaCa(dados) +
    tamanhoPor(dados.tamanho).mod +
    n(dados.caNatural) +
    n(dados.caDeflexao) +
    n(dados.caMisc)
  );
}

/** CA de toque: ignora armadura, escudo e armadura natural. */
export function caToqueAuto(dados: DadosFicha): number {
  return (
    10 +
    desAplicadaCa(dados) +
    tamanhoPor(dados.tamanho).mod +
    n(dados.caDeflexao) +
    n(dados.caMisc)
  );
}

/** CA desprevenido: perde o bônus de Destreza (quando positivo). */
export function caDesprevenidoAuto(dados: DadosFicha): number {
  const des = desAplicadaCa(dados);
  return caTotalAuto(dados) - Math.max(0, des);
}

export function iniciativaAuto(dados: DadosFicha): number {
  return modAtributo(dados, "destreza") + n(dados.iniciativaMisc);
}

// A base vem das classes quando o campo está vazio — assim escolher
// "Guerreiro 6" já preenche Fortitude sem ninguém consultar a tabela.

export function fortitudeAuto(dados: DadosFicha): number {
  return (
    (dados.fortBase ?? resistenciaBaseAuto(dados, "fortitude")) +
    modAtributo(dados, "constituicao") +
    n(dados.fortMagico) +
    n(dados.fortMisc)
  );
}

export function reflexosAuto(dados: DadosFicha): number {
  return (
    (dados.refBase ?? resistenciaBaseAuto(dados, "reflexos")) +
    modAtributo(dados, "destreza") +
    n(dados.refMagico) +
    n(dados.refMisc)
  );
}

export function vontadeAuto(dados: DadosFicha): number {
  return (
    (dados.vonBase ?? resistenciaBaseAuto(dados, "vontade")) +
    modAtributo(dados, "sabedoria") +
    n(dados.vonMagico) +
    n(dados.vonMisc)
  );
}

// --- Derivações a partir das classes ---

/** Nível total do personagem (soma das classes). */
export function nivelTotal(dados: DadosFicha): number {
  return dados.classes.reduce((s, c) => s + n(c.nivel), 0);
}

/** BBA somado das classes. Multiclasse soma o BBA de cada uma. */
export function bbaAuto(dados: DadosFicha): number {
  return dados.classes.reduce((soma, linha) => {
    const classe = classePor(linha.classe);
    if (!classe) return soma;
    return soma + bbaDaClasse(classe.bba, n(linha.nivel));
  }, 0);
}

/** Resistência-base somada das classes, para uma das três resistências. */
export function resistenciaBaseAuto(
  dados: DadosFicha,
  qual: "fortitude" | "reflexos" | "vontade",
): number {
  return dados.classes.reduce((soma, linha) => {
    const classe = classePor(linha.classe);
    if (!classe) return soma;
    const boa = classe.resistenciasBoas.includes(qual);
    return soma + resistenciaBase(boa, n(linha.nivel));
  }, 0);
}

/**
 * Níveis para efeito de PV: o total das classes, ou quantas rolagens de PV
 * existem quando as classes ainda não foram preenchidas.
 */
function niveisParaPv(dados: DadosFicha): number {
  return Math.max(nivelTotal(dados), dados.pvNiveis.length);
}

/**
 * PV máximo: soma do que foi rolado em cada nível, mais o modificador de
 * Constituição uma vez por nível (regra do 3.5).
 */
export function pvMaxAuto(dados: DadosFicha): number {
  const rolado = dados.pvNiveis.reduce<number>((s, v) => s + n(v), 0);
  return rolado + modAtributo(dados, "constituicao") * niveisParaPv(dados);
}

export function pvMax(dados: DadosFicha): number {
  return dados.pvMax ?? pvMaxAuto(dados);
}

/** Ids das perícias que são de classe, unindo todas as classes do personagem. */
export function periciasDeClasse(dados: DadosFicha): Set<string> {
  const ids = new Set<string>();
  for (const linha of dados.classes) {
    const classe = classePor(linha.classe);
    if (!classe) continue;
    for (const id of classe.periciasClasse) ids.add(id);
  }
  return ids;
}

/**
 * O BBA pode ser progressivo ("+6/+1"), então é texto. Para as contas usamos
 * o primeiro número, que é o ataque principal. Quando o campo está vazio,
 * cai no BBA calculado a partir das classes.
 */
export function bbaPrincipal(dados: DadosFicha): number {
  const m = dados.bba.match(/[+-]?\d+/);
  if (m) return Number(m[0]);
  return bbaAuto(dados);
}

export function ataqueCorpoAuto(dados: DadosFicha): number {
  return (
    bbaPrincipal(dados) +
    modAtributo(dados, "forca") +
    tamanhoPor(dados.tamanho).mod +
    n(dados.ataqueCorpoMisc)
  );
}

export function ataqueDistanciaAuto(dados: DadosFicha): number {
  return (
    bbaPrincipal(dados) +
    modAtributo(dados, "destreza") +
    tamanhoPor(dados.tamanho).mod +
    n(dados.ataqueDistanciaMisc)
  );
}

/** Agarrar usa o modificador de tamanho ESPECIAL, não o comum. */
export function agarrarAuto(dados: DadosFicha): number {
  return (
    bbaPrincipal(dados) +
    modAtributo(dados, "forca") +
    tamanhoPor(dados.tamanho).agarrar +
    n(dados.agarrarMisc)
  );
}

// Valores EFETIVOS: a sobrescrita manual quando existe, senão o cálculo.
// É o que qualquer tela deve consumir — ficha, painel do mestre, futuras
// exportações — para que ninguém mostre um número diferente do outro.

export function ca(dados: DadosFicha): number {
  return dados.caTotal ?? caTotalAuto(dados);
}
export function caToque(dados: DadosFicha): number {
  return dados.caToque ?? caToqueAuto(dados);
}
export function caDesprevenido(dados: DadosFicha): number {
  return dados.caDesprevenido ?? caDesprevenidoAuto(dados);
}
export function iniciativa(dados: DadosFicha): number {
  return dados.iniciativaTotal ?? iniciativaAuto(dados);
}
export function fortitude(dados: DadosFicha): number {
  return dados.fortTotal ?? fortitudeAuto(dados);
}
export function reflexos(dados: DadosFicha): number {
  return dados.refTotal ?? reflexosAuto(dados);
}
export function vontade(dados: DadosFicha): number {
  return dados.vonTotal ?? vontadeAuto(dados);
}
export function ataqueCorpo(dados: DadosFicha): number {
  return dados.ataqueCorpoTotal ?? ataqueCorpoAuto(dados);
}
export function ataqueDistancia(dados: DadosFicha): number {
  return dados.ataqueDistanciaTotal ?? ataqueDistanciaAuto(dados);
}
export function agarrar(dados: DadosFicha): number {
  return dados.agarrarTotal ?? agarrarAuto(dados);
}

/** Total de uma perícia: graduações + atributo + diversos + penalidade. */
export function totalPericia(
  pericia: (typeof PERICIAS)[number],
  entrada: PericiaFicha | undefined,
  dados: DadosFicha,
): number {
  const penal = pericia.armadura
    ? (pericia.dobraArmadura ? 2 : 1) * -Math.abs(penalidadeArmadura(dados))
    : 0;
  return (
    n(entrada?.ranks) +
    modAtributo(dados, pericia.atributo) +
    n(entrada?.misc) +
    penal
  );
}

/**
 * Carga máxima por Força, em quilos.
 *
 * Fonte: tabela de capacidade de carga do SRD 3.5 (em libras), convertida a
 * 1 lb = 0,5 kg — a conversão métrica usada nas edições brasileiras. Confira
 * contra o seu livro: qualquer divergência é resolvida na sobrescrita manual.
 */
const CARGA_MAX_LB = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 115, 130, 150, 175, 200, 230, 260,
  300, 350, 400, 460, 520, 600, 700, 800, 920, 1040, 1200, 1400,
];

export function cargaMaximaKg(forca: number | null): number {
  const f = n(forca);
  if (f <= 0) return 0;
  if (f < CARGA_MAX_LB.length) return CARGA_MAX_LB[f] / 2;
  // Acima de 29: a cada +10 de Força, a capacidade quadruplica.
  const excedente = Math.floor((f - 20) / 10);
  const base = CARGA_MAX_LB[f - excedente * 10] ?? CARGA_MAX_LB[29];
  return (base * Math.pow(4, excedente)) / 2;
}

export function cargasAuto(dados: DadosFicha): {
  leve: number;
  media: number;
  pesada: number;
} {
  const max = cargaMaximaKg(atributoEmVigor(dados, "forca"));
  return {
    leve: Math.floor(max / 3),
    media: Math.floor((max * 2) / 3),
    pesada: Math.floor(max),
  };
}

/** 50 moedas pesam meio quilo (1 lb no SRD). */
export function pesoMoedas(d: Dinheiro): number {
  const moedas = n(d.pl) + n(d.po) + n(d.pp) + n(d.pc);
  return moedas / 100;
}

export function pesoTotalAuto(dados: DadosFicha): number {
  const itens = dados.equipamento.reduce(
    (s, i) => s + n(i.peso) * (i.qtd == null ? 1 : n(i.qtd)),
    0,
  );
  const armaduras = dados.armaduras.reduce((s, a) => s + n(a.peso), 0);
  return (
    Math.round((itens + armaduras + pesoMoedas(dados.dinheiro)) * 100) / 100
  );
}

/** CD de resistência de uma magia: 10 + nível + mod. do atributo-chave. */
export function cdMagiaAuto(dados: DadosFicha, nivel: number): number {
  const chave = dados.conjuracaoAtributo as ChaveAtributo;
  const mod = ATRIBUTOS.some((a) => a.chave === chave)
    ? modAtributo(dados, chave)
    : 0;
  return 10 + nivel + mod;
}

// ---------------------------------------------------------------------------
// Leitura e normalização
// ---------------------------------------------------------------------------

export function periciaVazia(): PericiaFicha {
  return { ranks: null, misc: null, classe: false };
}

function atributosVazios(): Atributos {
  return {
    forca: null,
    destreza: null,
    constituicao: null,
    inteligencia: null,
    sabedoria: null,
    carisma: null,
  };
}

function niveisMagiaVazios(): NivelMagia[] {
  return Array.from({ length: 10 }, () => ({
    conhecidas: "",
    porDia: "",
    cd: null,
  }));
}

export function dadosVazios(): DadosFicha {
  return {
    jogador: "",
    classeNivel: "",
    classes: [],
    racaId: "",
    raca: "",
    alinhamento: "",
    divindade: "",
    tamanho: "medio",
    idade: "",
    sexo: "",
    altura: "",
    peso: "",
    olhos: "",
    cabelo: "",
    pele: "",
    xpAtual: null,
    xpProximo: null,
    atributos: atributosVazios(),
    atributosTemp: atributosVazios(),
    pvNiveis: [],
    pvMax: null,
    pvAtual: null,
    danoNaoLetal: null,
    reducaoDano: "",
    caArmadura: null,
    caEscudo: null,
    caNatural: null,
    caDeflexao: null,
    caMisc: null,
    caTotal: null,
    caToque: null,
    caDesprevenido: null,
    iniciativaMisc: null,
    iniciativaTotal: null,
    deslocamento: "",
    fortBase: null,
    fortMagico: null,
    fortMisc: null,
    fortTotal: null,
    refBase: null,
    refMagico: null,
    refMisc: null,
    refTotal: null,
    vonBase: null,
    vonMagico: null,
    vonMisc: null,
    vonTotal: null,
    bba: "",
    ataqueCorpoMisc: null,
    ataqueCorpoTotal: null,
    ataqueDistanciaMisc: null,
    ataqueDistanciaTotal: null,
    agarrarMisc: null,
    agarrarTotal: null,
    armas: [],
    armaduras: [],
    penalidadeArmadura: null,
    falhaMagiaTotal: null,
    pericias: {},
    talentos: [],
    habilidades: [],
    idiomas: "",
    equipamento: [],
    dinheiro: { pl: null, po: null, pp: null, pc: null },
    pesoTotal: null,
    cargaLeve: null,
    cargaMedia: null,
    cargaPesada: null,
    conjuracaoClasse: "",
    conjuracaoAtributo: "",
    magiasPorNivel: niveisMagiaVazios(),
    magias: [],
    periciasExtras: [],
  };
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const x = Number(v);
  return Number.isNaN(x) ? null : x;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function lerLista<T>(v: unknown, montar: (i: Record<string, unknown>) => T): T[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((i): i is Record<string, unknown> => !!i && typeof i === "object")
    .map(montar);
}

function lerAtributos(v: unknown): Atributos {
  const a = obj(v);
  return {
    forca: num(a.forca),
    destreza: num(a.destreza),
    constituicao: num(a.constituicao),
    inteligencia: num(a.inteligencia),
    sabedoria: num(a.sabedoria),
    carisma: num(a.carisma),
  };
}

/**
 * Lê as perícias aceitando dois vocabulários: o desta versão
 * (`ranks`/`misc`) e o de uma versão anterior do projeto (`grad`/`outros`),
 * encontrada em fichas já existentes no banco.
 */
function lerPericias(v: unknown): Record<string, PericiaFicha> {
  const entrada = obj(v);
  const saida: Record<string, PericiaFicha> = {};
  for (const p of PERICIAS) {
    const item = entrada[p.id];
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    saida[p.id] = {
      ranks: num(o.ranks) ?? num(o.grad),
      misc: num(o.misc) ?? num(o.outros),
      classe: o.classe === true,
    };
  }
  return saida;
}

function lerNiveisMagia(v: unknown): NivelMagia[] {
  const base = niveisMagiaVazios();
  if (!Array.isArray(v)) return base;
  return base.map((vazio, i) => {
    const item = v[i];
    if (!item || typeof item !== "object") return vazio;
    const o = item as Record<string, unknown>;
    return {
      conhecidas: str(o.conhecidas),
      porDia: str(o.porDia),
      cd: num(o.cd),
    };
  });
}

/**
 * Normaliza o JSON do banco para DadosFicha.
 *
 * Compatibilidade: fichas salvas antes desta versão guardavam os totais de CA,
 * iniciativa e resistências como valores diretos. Eles viram sobrescritas
 * manuais — o número que o jogador digitou continua aparecendo, e ele pode
 * limpar o campo para passar a usar o cálculo.
 */
export function lerDados(json: unknown): DadosFicha {
  if (!json || typeof json !== "object") return dadosVazios();
  const j = obj(json);
  const d = obj(j.dinheiro);

  return {
    jogador: str(j.jogador),
    classeNivel: str(j.classeNivel),
    classes: lerLista(j.classes, (i) => ({
      classe: str(i.classe),
      nivel: num(i.nivel),
    })),
    racaId: str(j.racaId),
    raca: str(j.raca),
    alinhamento: str(j.alinhamento),
    divindade: str(j.divindade),
    tamanho: str(j.tamanho) || "medio",
    idade: str(j.idade),
    sexo: str(j.sexo),
    altura: str(j.altura),
    peso: str(j.peso),
    olhos: str(j.olhos),
    cabelo: str(j.cabelo),
    pele: str(j.pele),
    // `xp` é o nome usado na versão anterior do projeto.
    xpAtual: num(j.xpAtual) ?? num(j.xp),
    xpProximo: num(j.xpProximo),

    atributos: lerAtributos(j.atributos),
    atributosTemp: lerAtributos(j.atributosTemp),

    pvNiveis: Array.isArray(j.pvNiveis) ? j.pvNiveis.map(num) : [],
    pvMax: num(j.pvMax),
    pvAtual: num(j.pvAtual),
    danoNaoLetal: num(j.danoNaoLetal),
    reducaoDano: str(j.reducaoDano),

    caArmadura: num(j.caArmadura),
    caEscudo: num(j.caEscudo),
    caNatural: num(j.caNatural),
    caDeflexao: num(j.caDeflexao),
    caMisc: num(j.caMisc),
    // `j.ca` é o formato antigo: total digitado à mão.
    caTotal: num(j.caTotal) ?? num(j.ca),
    caToque: num(j.caToque),
    caDesprevenido: num(j.caDesprevenido),

    iniciativaMisc: num(j.iniciativaMisc),
    iniciativaTotal: num(j.iniciativaTotal) ?? num(j.iniciativa),
    deslocamento: str(j.deslocamento),

    fortBase: num(j.fortBase),
    fortMagico: num(j.fortMagico),
    fortMisc: num(j.fortMisc),
    fortTotal: num(j.fortTotal) ?? num(j.fortitude),
    refBase: num(j.refBase),
    refMagico: num(j.refMagico),
    refMisc: num(j.refMisc),
    refTotal: num(j.refTotal) ?? num(j.reflexos),
    vonBase: num(j.vonBase),
    vonMagico: num(j.vonMagico),
    vonMisc: num(j.vonMisc),
    vonTotal: num(j.vonTotal) ?? num(j.vontade),

    bba: typeof j.bba === "number" ? String(j.bba) : str(j.bba),
    ataqueCorpoMisc: num(j.ataqueCorpoMisc),
    ataqueCorpoTotal: num(j.ataqueCorpoTotal),
    ataqueDistanciaMisc: num(j.ataqueDistanciaMisc),
    ataqueDistanciaTotal: num(j.ataqueDistanciaTotal),
    agarrarMisc: num(j.agarrarMisc),
    agarrarTotal: num(j.agarrarTotal) ?? num(j.agarrar),
    armas: lerLista(j.armas, (i) => ({
      nome: str(i.nome),
      bonus: str(i.bonus),
      dano: str(i.dano),
      critico: str(i.critico),
      alcance: str(i.alcance),
      tipo: str(i.tipo),
      municao: str(i.municao),
      notas: str(i.notas),
    })),

    armaduras: lerLista(j.armaduras, (i) => ({
      nome: str(i.nome),
      tipo: str(i.tipo),
      bonusCa: num(i.bonusCa),
      desMax: num(i.desMax),
      penalidade: num(i.penalidade),
      falhaMagia: num(i.falhaMagia),
      deslocamento: str(i.deslocamento),
      peso: num(i.peso),
    })),
    penalidadeArmadura: num(j.penalidadeArmadura),
    falhaMagiaTotal: num(j.falhaMagiaTotal),

    pericias: lerPericias(j.pericias),

    talentos: lerLista(j.talentos, (i) => ({
      nome: str(i.nome),
      notas: str(i.notas),
    })),
    habilidades: lerLista(j.habilidades, (i) => ({
      nome: str(i.nome),
      notas: str(i.notas),
    })),
    idiomas: str(j.idiomas),

    equipamento: lerLista(j.equipamento, (i) => ({
      nome: str(i.nome),
      qtd: num(i.qtd),
      peso: num(i.peso),
      notas: str(i.notas),
    })),
    dinheiro: {
      pl: num(d.pl),
      po: num(d.po),
      pp: num(d.pp),
      pc: num(d.pc),
    },
    pesoTotal: num(j.pesoTotal),
    cargaLeve: num(j.cargaLeve),
    cargaMedia: num(j.cargaMedia),
    cargaPesada: num(j.cargaPesada),

    conjuracaoClasse: str(j.conjuracaoClasse),
    conjuracaoAtributo: str(j.conjuracaoAtributo),
    magiasPorNivel: lerNiveisMagia(j.magiasPorNivel),
    magias: lerLista(j.magias, (i) => ({
      nome: str(i.nome),
      nivel: str(i.nivel),
      escola: str(i.escola),
      preparadas: str(i.preparadas),
      notas: str(i.notas),
    })),

    // Passa adiante sem interpretar: não sabemos o que é, mas não destruímos.
    periciasExtras: Array.isArray(j.periciasExtras) ? j.periciasExtras : [],
  };
}
