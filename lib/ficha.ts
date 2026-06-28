// Estrutura (MVP) e helpers da ficha de D&D 3.5.
// Os valores ficam num JSON; vamos estruturando por partes ("aos poucos").

export type Atributos = {
  forca: number | null;
  destreza: number | null;
  constituicao: number | null;
  inteligencia: number | null;
  sabedoria: number | null;
  carisma: number | null;
};

export type DadosFicha = {
  raca: string;
  classeNivel: string;
  alinhamento: string;
  atributos: Atributos;
  pvAtual: number | null;
  pvMax: number | null;
  ca: number | null;
  iniciativa: number | null;
  deslocamento: string;
  fortitude: number | null;
  reflexos: number | null;
  vontade: number | null;
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

export const ATRIBUTOS: {
  chave: keyof Atributos;
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

/** Modificador de atributo de D&D 3.5: floor((valor - 10) / 2). */
export function modificador(valor: number | null | undefined): number {
  if (valor == null || Number.isNaN(valor)) return 0;
  return Math.floor((valor - 10) / 2);
}

export function formatarMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function dadosVazios(): DadosFicha {
  return {
    raca: "",
    classeNivel: "",
    alinhamento: "",
    atributos: {
      forca: null,
      destreza: null,
      constituicao: null,
      inteligencia: null,
      sabedoria: null,
      carisma: null,
    },
    pvAtual: null,
    pvMax: null,
    ca: null,
    iniciativa: null,
    deslocamento: "",
    fortitude: null,
    reflexos: null,
    vontade: null,
  };
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** Normaliza o JSON vindo do banco para o formato DadosFicha. */
export function lerDados(json: unknown): DadosFicha {
  if (!json || typeof json !== "object") return dadosVazios();
  const j = json as Record<string, unknown>;
  const a = (
    j.atributos && typeof j.atributos === "object" ? j.atributos : {}
  ) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    raca: str(j.raca),
    classeNivel: str(j.classeNivel),
    alinhamento: str(j.alinhamento),
    atributos: {
      forca: num(a.forca),
      destreza: num(a.destreza),
      constituicao: num(a.constituicao),
      inteligencia: num(a.inteligencia),
      sabedoria: num(a.sabedoria),
      carisma: num(a.carisma),
    },
    pvAtual: num(j.pvAtual),
    pvMax: num(j.pvMax),
    ca: num(j.ca),
    iniciativa: num(j.iniciativa),
    deslocamento: str(j.deslocamento),
    fortitude: num(j.fortitude),
    reflexos: num(j.reflexos),
    vontade: num(j.vontade),
  };
}
