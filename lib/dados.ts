// Interpretador de expressões de dado ("2d6+3", "1d20-1", "4d6").
//
// Funções puras de propósito: a rolagem recebe o sorteador por parâmetro, o que
// mantém o parser testável e o componente livre de lógica de regra.

export type TermoDado = {
  tipo: "dado";
  sinal: 1 | -1;
  quantidade: number;
  faces: number;
};

export type TermoFixo = {
  tipo: "fixo";
  sinal: 1 | -1;
  valor: number;
};

export type Termo = TermoDado | TermoFixo;

export type Resultado = {
  total: number;
  partes: {
    termo: Termo;
    /** Valor de cada dado rolado; vazio nos termos fixos. */
    valores: number[];
    subtotal: number;
  }[];
};

/** Limites para não travar a página com "9999d9999". */
const MAX_QUANTIDADE = 100;
const MAX_FACES = 1000;

export type Analise =
  | { ok: true; termos: Termo[] }
  | { ok: false; erro: string };

/** Lê uma expressão de dado e devolve os termos, ou o motivo da recusa. */
export function analisar(entrada: string): Analise {
  const texto = entrada.toLowerCase().replace(/\s+/g, "");
  if (texto === "") return { ok: false, erro: "Escreva algo como 1d20+5." };

  if (/[^0-9d+-]/.test(texto)) {
    return { ok: false, erro: "Use apenas números, d, + e −." };
  }

  // Normaliza para que todo termo comece com sinal explícito.
  const normalizado = /^[+-]/.test(texto) ? texto : `+${texto}`;

  const termos: Termo[] = [];
  const padrao = /([+-])(\d*d\d+|\d+)/g;
  let consumido = 0;
  let m: RegExpExecArray | null;

  while ((m = padrao.exec(normalizado)) !== null) {
    if (m.index !== consumido) break; // houve lixo entre os termos
    consumido = padrao.lastIndex;

    const sinal: 1 | -1 = m[1] === "-" ? -1 : 1;
    const corpo = m[2];

    if (corpo.includes("d")) {
      const [q, f] = corpo.split("d");
      const quantidade = q === "" ? 1 : Number(q);
      const faces = Number(f);

      if (quantidade < 1) {
        return { ok: false, erro: "A quantidade de dados precisa ser 1 ou mais." };
      }
      if (quantidade > MAX_QUANTIDADE) {
        return { ok: false, erro: `No máximo ${MAX_QUANTIDADE} dados por rolagem.` };
      }
      if (faces < 2) return { ok: false, erro: "Um dado precisa ter 2 faces ou mais." };
      if (faces > MAX_FACES) {
        return { ok: false, erro: `No máximo ${MAX_FACES} faces por dado.` };
      }

      termos.push({ tipo: "dado", sinal, quantidade, faces });
    } else {
      termos.push({ tipo: "fixo", sinal, valor: Number(corpo) });
    }
  }

  if (consumido !== normalizado.length || termos.length === 0) {
    return { ok: false, erro: "Não entendi a expressão. Tente 2d6+3." };
  }

  return { ok: true, termos };
}

/** Rola os termos. `sortear(faces)` devolve um valor de 1 a `faces`. */
export function rolar(
  termos: Termo[],
  sortear: (faces: number) => number = sortearPadrao,
): Resultado {
  let total = 0;
  const partes: Resultado["partes"] = [];

  for (const termo of termos) {
    if (termo.tipo === "fixo") {
      const subtotal = termo.sinal * termo.valor;
      total += subtotal;
      partes.push({ termo, valores: [], subtotal });
      continue;
    }

    const valores: number[] = [];
    for (let i = 0; i < termo.quantidade; i++) valores.push(sortear(termo.faces));

    const soma = valores.reduce((a, b) => a + b, 0);
    const subtotal = termo.sinal * soma;
    total += subtotal;
    partes.push({ termo, valores, subtotal });
  }

  return { total, partes };
}

function sortearPadrao(faces: number): number {
  return Math.floor(Math.random() * faces) + 1;
}

/** Reescreve os termos no formato canônico, para exibir no histórico. */
export function formatarTermos(termos: Termo[]): string {
  return termos
    .map((termo, i) => {
      const corpo =
        termo.tipo === "dado"
          ? `${termo.quantidade}d${termo.faces}`
          : String(termo.valor);
      if (i === 0) return termo.sinal === -1 ? `-${corpo}` : corpo;
      return `${termo.sinal === -1 ? " − " : " + "}${corpo}`;
    })
    .join("");
}
