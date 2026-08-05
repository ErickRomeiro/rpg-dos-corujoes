// Acesso ao catálogo de dados de jogo (lado servidor).
//
// Regra de visibilidade: conteúdo com `mesaId` nulo é oficial e aparece em
// qualquer mesa; conteúdo com `mesaId` preenchido é homebrew e só aparece na
// mesa dona. Quando os dois existem com o mesmo nome, o da mesa vence — é o
// que permite ao mestre sobrescrever uma arma do SRD com a versão da casa.

import { prisma } from "@/lib/prisma";
import type { TipoCatalogo } from "@/lib/generated/prisma/enums";
import type { Raca } from "@/lib/dnd35/racas";
import type { Classe } from "@/lib/dnd35/classes";
import type { ArmaModelo, ArmaduraModelo } from "@/lib/dnd35/equipamento";
import type { Talento } from "@/lib/dnd35/talentos";

const SISTEMA = "dnd35";

export type EntradaCatalogo<T> = {
  id: string;
  nome: string;
  fonte: string;
  /** true quando veio do homebrew da mesa. */
  daMesa: boolean;
  dados: T;
};

/**
 * Lista as entradas de um tipo, já resolvendo a precedência do homebrew.
 * `mesaId` ausente devolve só o conteúdo oficial.
 */
export async function listarCatalogo<T>(
  tipo: TipoCatalogo,
  mesaId?: string | null,
): Promise<EntradaCatalogo<T>[]> {
  const itens = await prisma.itemCatalogo.findMany({
    where: {
      sistema: SISTEMA,
      tipo,
      OR: [{ mesaId: null }, ...(mesaId ? [{ mesaId }] : [])],
    },
    select: { id: true, nome: true, fonte: true, mesaId: true, dados: true },
    orderBy: { nome: "asc" },
  });

  // Homebrew da mesa substitui o oficial de mesmo nome.
  const porNome = new Map<string, EntradaCatalogo<T>>();
  for (const item of itens) {
    const entrada: EntradaCatalogo<T> = {
      id: item.id,
      nome: item.nome,
      fonte: item.fonte,
      daMesa: item.mesaId != null,
      dados: item.dados as T,
    };
    const existente = porNome.get(item.nome);
    if (!existente || entrada.daMesa) porNome.set(item.nome, entrada);
  }

  return [...porNome.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Busca por nome, para autocompletes de conjuntos grandes (magias). */
export async function buscarCatalogo<T>(
  tipo: TipoCatalogo,
  termo: string,
  mesaId?: string | null,
  limite = 20,
): Promise<EntradaCatalogo<T>[]> {
  const itens = await prisma.itemCatalogo.findMany({
    where: {
      sistema: SISTEMA,
      tipo,
      nome: { contains: termo, mode: "insensitive" },
      OR: [{ mesaId: null }, ...(mesaId ? [{ mesaId }] : [])],
    },
    select: { id: true, nome: true, fonte: true, mesaId: true, dados: true },
    orderBy: { nome: "asc" },
    take: limite,
  });

  return itens.map((i) => ({
    id: i.id,
    nome: i.nome,
    fonte: i.fonte,
    daMesa: i.mesaId != null,
    dados: i.dados as T,
  }));
}

/** Tudo que a ficha precisa para autocompletar, numa consulta só por tipo. */
export type CatalogoFicha = {
  racas: EntradaCatalogo<Raca>[];
  classes: EntradaCatalogo<Classe>[];
  armas: EntradaCatalogo<ArmaModelo>[];
  armaduras: EntradaCatalogo<ArmaduraModelo>[];
  talentos: EntradaCatalogo<Talento>[];
  itens: EntradaCatalogo<{ nome: string; peso: number }>[];
};

export async function catalogoDaFicha(
  mesaId?: string | null,
): Promise<CatalogoFicha> {
  const [racas, classes, armas, armaduras, talentos, itens] = await Promise.all([
    listarCatalogo<Raca>("RACA", mesaId),
    listarCatalogo<Classe>("CLASSE", mesaId),
    listarCatalogo<ArmaModelo>("ARMA", mesaId),
    listarCatalogo<ArmaduraModelo>("ARMADURA", mesaId),
    listarCatalogo<Talento>("TALENTO", mesaId),
    listarCatalogo<{ nome: string; peso: number }>("ITEM", mesaId),
  ]);

  return { racas, classes, armas, armaduras, talentos, itens };
}
