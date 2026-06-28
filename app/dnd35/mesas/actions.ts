"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PapelMesa } from "@/lib/generated/prisma/enums";
import { usuarioAtual, ehDono, podeGerenciarMesa } from "@/lib/permissoes";

const SISTEMA = "dnd35";
const BASE = `/${SISTEMA}/mesas`;

export type EstadoForm = { erro?: string; ok?: boolean } | undefined;

// Criar mesa — apenas o dono.
export async function criarMesa(
  _prev: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const user = await usuarioAtual();
  if (!ehDono(user)) return { erro: "Apenas o dono pode criar mesas." };

  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;
  if (!nome) return { erro: "Dê um nome à mesa." };

  const mesa = await prisma.mesa.create({
    data: { nome, descricao, sistema: SISTEMA, criadoPorId: user!.id },
  });

  revalidatePath(BASE);
  redirect(`${BASE}/${mesa.id}`);
}

// Adicionar membro — dono ou mestre da mesa.
export async function adicionarMembro(
  _prev: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const user = await usuarioAtual();
  const mesaId = String(formData.get("mesaId") ?? "");
  if (!(await podeGerenciarMesa(user, mesaId))) {
    return { erro: "Você não tem permissão para gerenciar esta mesa." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const papel =
    String(formData.get("papel")) === "MESTRE"
      ? PapelMesa.MESTRE
      : PapelMesa.JOGADOR;
  if (!email) return { erro: "Informe o e-mail." };

  const alvo = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (!alvo) {
    return {
      erro: "Nenhum usuário com esse e-mail. A pessoa precisa entrar no site (login) ao menos uma vez antes de ser adicionada.",
    };
  }

  const jaMembro = await prisma.membroMesa.findUnique({
    where: { mesaId_userId: { mesaId, userId: alvo.id } },
    select: { id: true },
  });
  if (jaMembro) return { erro: "Esse usuário já é membro da mesa." };

  await prisma.membroMesa.create({
    data: { mesaId, userId: alvo.id, papel },
  });

  revalidatePath(`${BASE}/${mesaId}`);
  return { ok: true };
}

// Alterar papel de um membro — dono ou mestre da mesa.
export async function alterarPapel(formData: FormData) {
  const user = await usuarioAtual();
  const membroId = String(formData.get("membroId") ?? "");
  const membro = await prisma.membroMesa.findUnique({
    where: { id: membroId },
    select: { mesaId: true },
  });
  if (!membro) return;
  if (!(await podeGerenciarMesa(user, membro.mesaId))) return;

  const papel =
    String(formData.get("papel")) === "MESTRE"
      ? PapelMesa.MESTRE
      : PapelMesa.JOGADOR;
  await prisma.membroMesa.update({ where: { id: membroId }, data: { papel } });
  revalidatePath(`${BASE}/${membro.mesaId}`);
}

// Remover membro — dono ou mestre da mesa.
export async function removerMembro(formData: FormData) {
  const user = await usuarioAtual();
  const membroId = String(formData.get("membroId") ?? "");
  const membro = await prisma.membroMesa.findUnique({
    where: { id: membroId },
    select: { mesaId: true },
  });
  if (!membro) return;
  if (!(await podeGerenciarMesa(user, membro.mesaId))) return;

  await prisma.membroMesa.delete({ where: { id: membroId } });
  revalidatePath(`${BASE}/${membro.mesaId}`);
}

// Excluir mesa — apenas o dono.
export async function excluirMesa(formData: FormData) {
  const user = await usuarioAtual();
  if (!ehDono(user)) return;
  const mesaId = String(formData.get("mesaId") ?? "");
  await prisma.mesa.delete({ where: { id: mesaId } });
  revalidatePath(BASE);
  redirect(BASE);
}
