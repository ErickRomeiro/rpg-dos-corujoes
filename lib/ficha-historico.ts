// Compara duas versões de uma ficha e diz, em português, o que mudou.
//
// O histórico guarda só a diferença, e não uma cópia da ficha. A ficha é um
// JSON grande e quase todo salvamento mexe em dois ou três campos; guardar o
// todo a cada vez cresceria rápido e ainda exigiria comparar versões na hora
// de mostrar. Aqui a comparação acontece uma vez, no salvamento, e o que fica
// gravado já é o que a tela precisa exibir.
//
// A estratégia é achatar cada versão num mapa "rótulo legível -> valor
// legível" e comparar os dois mapas. Achatar em vez de percorrer a árvore
// mantém a comparação com um caminho só, e faz campo novo aparecer sozinho no
// histórico: basta que ele entre no achatamento.
//
// Consequência aceita: o que não é achatado não é historiado. `periciasExtras`
// é o caso — ninguém sabe o que há lá dentro (ver DadosFicha), então ele entra
// inteiro, como um valor só, em vez de fingir que entendemos sua estrutura.

import {
  ATRIBUTOS,
  PERICIAS,
  type DadosFicha,
  type ChaveAtributo,
} from "./ficha.ts";

export type Mudanca = {
  /** Rótulo legível, ex.: "PV atual" ou "Perícia · Escalar (graduações)". */
  campo: string;
  /** Valor anterior já formatado. Vazio = não existia. */
  de: string;
  /** Valor novo já formatado. Vazio = deixou de existir. */
  para: string;
};

/** Rótulo de cada campo simples da ficha. Campo fora daqui não é historiado. */
const ROTULOS: Partial<Record<keyof DadosFicha, string>> = {
  jogador: "Jogador",
  classeNivel: "Classe e nível (texto livre)",
  racaId: "Raça (id)",
  raca: "Raça",
  alinhamento: "Alinhamento",
  divindade: "Divindade",
  tamanho: "Tamanho",
  idade: "Idade",
  sexo: "Sexo",
  altura: "Altura",
  peso: "Peso",
  olhos: "Olhos",
  cabelo: "Cabelo",
  pele: "Pele",
  xpAtual: "XP atual",
  xpProximo: "XP para o próximo nível",
  pvMax: "PV máximo",
  pvAtual: "PV atual",
  danoNaoLetal: "Dano não-letal",
  reducaoDano: "Redução de dano",
  caArmadura: "CA · armadura",
  caEscudo: "CA · escudo",
  caNatural: "CA · natural",
  caDeflexao: "CA · deflexão",
  caMisc: "CA · diversos",
  caTotal: "CA total",
  caToque: "CA de toque",
  caDesprevenido: "CA desprevenido",
  iniciativaMisc: "Iniciativa · diversos",
  iniciativaTotal: "Iniciativa",
  deslocamento: "Deslocamento",
  fortBase: "Fortitude · base",
  fortMagico: "Fortitude · mágico",
  fortMisc: "Fortitude · diversos",
  fortTotal: "Fortitude",
  refBase: "Reflexos · base",
  refMagico: "Reflexos · mágico",
  refMisc: "Reflexos · diversos",
  refTotal: "Reflexos",
  vonBase: "Vontade · base",
  vonMagico: "Vontade · mágico",
  vonMisc: "Vontade · diversos",
  vonTotal: "Vontade",
  bba: "Bônus base de ataque",
  ataqueCorpoMisc: "Ataque corpo-a-corpo · diversos",
  ataqueCorpoTotal: "Ataque corpo-a-corpo",
  ataqueDistanciaMisc: "Ataque à distância · diversos",
  ataqueDistanciaTotal: "Ataque à distância",
  agarrarMisc: "Agarrar · diversos",
  agarrarTotal: "Agarrar",
  penalidadeArmadura: "Penalidade de armadura",
  falhaMagiaTotal: "Falha de magia arcana",
  idiomas: "Idiomas",
  pesoTotal: "Peso total",
  cargaLeve: "Carga leve",
  cargaMedia: "Carga média",
  cargaPesada: "Carga pesada",
  conjuracaoClasse: "Conjuração · classe",
  conjuracaoAtributo: "Conjuração · atributo",
};

const MOEDAS: { chave: keyof DadosFicha["dinheiro"]; rotulo: string }[] = [
  { chave: "pl", rotulo: "Platina" },
  { chave: "po", rotulo: "Ouro" },
  { chave: "pp", rotulo: "Prata" },
  { chave: "pc", rotulo: "Cobre" },
];

const texto = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "boolean") return v ? "sim" : "não";
  return String(v).trim();
};

/** Junta os campos preenchidos de um item de lista num resumo de uma linha. */
function resumo(obj: Record<string, unknown>, exceto = "nome"): string {
  const partes = Object.entries(obj)
    .filter(([k, v]) => k !== exceto && texto(v) !== "")
    .map(([k, v]) => `${k}: ${texto(v)}`);
  return partes.length ? partes.join(", ") : "(sem detalhes)";
}

/**
 * Rótulo de cada item de uma lista, dentro do grupo.
 *
 * A chave é o nome, porque é por ele que o jogador reconhece a linha. Nome
 * repetido ganha sufixo para as duas linhas não colidirem e uma sumir do
 * histórico — duas adagas iguais viram "Adaga" e "Adaga (2)".
 */
function chavesPorNome(itens: { nome?: string }[], grupo: string) {
  const vistos = new Map<string, number>();
  return itens.map((item) => {
    const nome = texto(item.nome) || "(sem nome)";
    const n = (vistos.get(nome) ?? 0) + 1;
    vistos.set(nome, n);
    return `${grupo} · ${nome}${n > 1 ? ` (${n})` : ""}`;
  });
}

/** Achata a ficha em "rótulo -> valor". Só entra o que está preenchido. */
function achatar(d: DadosFicha): Map<string, string> {
  const m = new Map<string, string>();
  const por = (rotulo: string, valor: unknown) => {
    const v = texto(valor);
    if (v !== "") m.set(rotulo, v);
  };

  for (const [chave, rotulo] of Object.entries(ROTULOS)) {
    por(rotulo, d[chave as keyof DadosFicha]);
  }

  for (const a of ATRIBUTOS) {
    por(a.rotulo, d.atributos?.[a.chave as ChaveAtributo]);
    por(`${a.rotulo} (temporário)`, d.atributosTemp?.[a.chave as ChaveAtributo]);
  }

  d.classes?.forEach((c) =>
    por(`Classe · ${texto(c.classe) || "(sem classe)"}`, c.nivel),
  );

  d.pvNiveis?.forEach((pv, i) => por(`PV do ${i + 1}º nível`, pv));

  for (const p of PERICIAS) {
    const f = d.pericias?.[p.id];
    if (!f) continue;
    por(`Perícia · ${p.nome} (graduações)`, f.ranks);
    por(`Perícia · ${p.nome} (diversos)`, f.misc);
    if (f.classe) por(`Perícia · ${p.nome} (de classe)`, true);
  }

  const listas: [string, { nome?: string }[] | undefined][] = [
    ["Arma", d.armas],
    ["Armadura", d.armaduras],
    ["Talento", d.talentos],
    ["Habilidade", d.habilidades],
    ["Equipamento", d.equipamento],
    ["Magia", d.magias],
  ];
  for (const [grupo, itens] of listas) {
    if (!itens) continue;
    const chaves = chavesPorNome(itens, grupo);
    itens.forEach((item, i) =>
      m.set(chaves[i], resumo(item as Record<string, unknown>)),
    );
  }

  for (const { chave, rotulo } of MOEDAS) por(rotulo, d.dinheiro?.[chave]);

  d.magiasPorNivel?.forEach((n, i) => {
    por(`Magias de ${i}º nível · conhecidas`, n.conhecidas);
    por(`Magias de ${i}º nível · por dia`, n.porDia);
    por(`Magias de ${i}º nível · CD`, n.cd);
  });

  // Não sabemos o que há aqui dentro, então entra inteiro ou não entra.
  if (d.periciasExtras?.length)
    m.set("Campo herdado (periciasExtras)", JSON.stringify(d.periciasExtras));

  return m;
}

/**
 * O que mudou de `antes` para `depois`, pronto para gravar e exibir.
 *
 * Devolve vazio quando nada mudou — e é assim que o salvamento sabe que não
 * vale a pena criar uma entrada de histórico.
 */
export function compararFichas(
  antes: DadosFicha,
  depois: DadosFicha,
): Mudanca[] {
  const a = achatar(antes);
  const b = achatar(depois);
  const mudancas: Mudanca[] = [];

  for (const [campo, para] of b) {
    const de = a.get(campo) ?? "";
    if (de !== para) mudancas.push({ campo, de, para });
  }
  for (const [campo, de] of a) {
    if (!b.has(campo)) mudancas.push({ campo, de, para: "" });
  }

  return mudancas.sort((x, y) => x.campo.localeCompare(y.campo, "pt-BR"));
}

/** Também compara o nome do personagem, que mora fora de `dados`. */
export function compararFicha(
  antes: { nome: string; dados: DadosFicha },
  depois: { nome: string; dados: DadosFicha },
): Mudanca[] {
  const mudancas = compararFichas(antes.dados, depois.dados);
  if (antes.nome !== depois.nome)
    mudancas.unshift({
      campo: "Personagem",
      de: antes.nome,
      para: depois.nome,
    });
  return mudancas;
}
