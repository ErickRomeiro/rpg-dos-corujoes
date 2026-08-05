"use server";

// Gestão do conteúdo próprio de cada mesa (homebrew) no catálogo.
//
// Regras de autorização, verificadas em TODA ação:
//   1. Só mestre da mesa (ou dono do site) cria, edita e apaga.
//   2. Conteúdo oficial (mesaId nulo) é INTOCÁVEL pela interface — ele vem do
//      seed do SRD e é a base compartilhada por todas as mesas.
//   3. Toda entrada nasce amarrada a uma mesa; não existe caminho para criar
//      conteúdo global por aqui.
//
// Server Actions são alcançáveis por POST direto, não só pela interface — por
// isso a checagem vive aqui dentro, e não na página que renderiza o formulário.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { TipoCatalogo } from "@/lib/generated/prisma/enums";
import { usuarioAtual, podeGerenciarMesa } from "@/lib/permissoes";

const SISTEMA = "dnd35";

export type EstadoCatalogo = { erro?: string; ok?: boolean } | undefined;

const TIPOS_VALIDOS: TipoCatalogo[] = [
  "RACA",
  "CLASSE",
  "ARMA",
  "ARMADURA",
  "TALENTO",
  "MAGIA",
  "ITEM",
  "DIVINDADE",
  "IDIOMA",
];

function tipoValido(v: string): v is TipoCatalogo {
  return (TIPOS_VALIDOS as string[]).includes(v);
}

function jsonForm(formData: FormData, name: string): unknown {
  const v = String(formData.get(name) ?? "");
  if (!v) return {};
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
}

/** Cria uma entrada de homebrew na mesa. */
export async function criarItemCatalogo(
  _prev: EstadoCatalogo,
  formData: FormData,
): Promise<EstadoCatalogo> {
  const user = await usuarioAtual();
  const mesaId = String(formData.get("mesaId") ?? "");

  if (!(await podeGerenciarMesa(user, mesaId))) {
    return { erro: "Só o mestre desta mesa pode criar conteúdo." };
  }

  const tipo = String(formData.get("tipo") ?? "");
  if (!tipoValido(tipo)) return { erro: "Tipo inválido." };

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Dê um nome ao item." };

  const dados = jsonForm(formData, "dados");

  const jaExiste = await prisma.itemCatalogo.findFirst({
    where: { sistema: SISTEMA, tipo, nome, mesaId },
    select: { id: true },
  });
  if (jaExiste) {
    return { erro: `Esta mesa já tem "${nome}" cadastrado como ${tipo}.` };
  }

  await prisma.itemCatalogo.create({
    data: {
      sistema: SISTEMA,
      tipo,
      nome,
      dados: dados as Prisma.InputJsonValue,
      fonte: "Homebrew",
      mesaId,
      criadoPorId: user!.id,
    },
  });

  revalidatePath(`/dnd35/mesas/${mesaId}/catalogo`);
  return { ok: true };
}

/** Edita uma entrada — só homebrew, e só da mesa que o usuário mestra. */
export async function atualizarItemCatalogo(
  _prev: EstadoCatalogo,
  formData: FormData,
): Promise<EstadoCatalogo> {
  const user = await usuarioAtual();
  const id = String(formData.get("id") ?? "");

  const item = await prisma.itemCatalogo.findUnique({
    where: { id },
    select: { mesaId: true },
  });
  if (!item) return { erro: "Item não encontrado." };

  // Conteúdo oficial não se edita pela interface — vem do seed.
  if (item.mesaId == null) {
    return {
      erro: "Conteúdo oficial do SRD não pode ser editado. Crie uma versão da mesa.",
    };
  }
  if (!(await podeGerenciarMesa(user, item.mesaId))) {
    return { erro: "Só o mestre desta mesa pode editar este item." };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "O item precisa de um nome." };

  await prisma.itemCatalogo.update({
    where: { id },
    data: {
      nome,
      dados: jsonForm(formData, "dados") as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/dnd35/mesas/${item.mesaId}/catalogo`);
  return { ok: true };
}

/** Apaga uma entrada de homebrew. */
export async function excluirItemCatalogo(formData: FormData) {
  const user = await usuarioAtual();
  const id = String(formData.get("id") ?? "");

  const item = await prisma.itemCatalogo.findUnique({
    where: { id },
    select: { mesaId: true },
  });
  if (!item || item.mesaId == null) return;
  if (!(await podeGerenciarMesa(user, item.mesaId))) return;

  await prisma.itemCatalogo.delete({ where: { id } });
  revalidatePath(`/dnd35/mesas/${item.mesaId}/catalogo`);
}
