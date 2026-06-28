"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { usuarioAtual, podeEditarFicha } from "@/lib/permissoes";
import { dadosVazios, type DadosFicha } from "@/lib/ficha";

const SISTEMA = "dnd35";
const BASE = `/${SISTEMA}/fichas`;

export type EstadoFicha = { erro?: string; ok?: boolean } | undefined;

function numForm(formData: FormData, name: string): number | null {
  const v = String(formData.get(name) ?? "").trim();
  if (v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

// Criar ficha — qualquer usuário logado cria as próprias.
export async function criarFicha(
  _prev: EstadoFicha,
  formData: FormData,
): Promise<EstadoFicha> {
  const user = await usuarioAtual();
  if (!user) return { erro: "Faça login." };

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Dê um nome ao personagem." };

  const ficha = await prisma.ficha.create({
    data: {
      userId: user.id,
      sistema: SISTEMA,
      nome,
      dados: dadosVazios() as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath(BASE);
  redirect(`${BASE}/${ficha.id}`);
}

// Salvar ficha — dono da ficha, mestre da mesa que a usa, ou dono do site.
export async function salvarFicha(
  _prev: EstadoFicha,
  formData: FormData,
): Promise<EstadoFicha> {
  const user = await usuarioAtual();
  const id = String(formData.get("id") ?? "");

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!ficha) return { erro: "Ficha não encontrada." };
  if (!(await podeEditarFicha(user, ficha, id))) {
    return { erro: "Você não tem permissão para editar esta ficha." };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "O personagem precisa de um nome." };

  const dados: DadosFicha = {
    raca: String(formData.get("raca") ?? "").trim(),
    classeNivel: String(formData.get("classeNivel") ?? "").trim(),
    alinhamento: String(formData.get("alinhamento") ?? "").trim(),
    atributos: {
      forca: numForm(formData, "forca"),
      destreza: numForm(formData, "destreza"),
      constituicao: numForm(formData, "constituicao"),
      inteligencia: numForm(formData, "inteligencia"),
      sabedoria: numForm(formData, "sabedoria"),
      carisma: numForm(formData, "carisma"),
    },
    pvAtual: numForm(formData, "pvAtual"),
    pvMax: numForm(formData, "pvMax"),
    ca: numForm(formData, "ca"),
    iniciativa: numForm(formData, "iniciativa"),
    deslocamento: String(formData.get("deslocamento") ?? "").trim(),
    fortitude: numForm(formData, "fortitude"),
    reflexos: numForm(formData, "reflexos"),
    vontade: numForm(formData, "vontade"),
  };

  await prisma.ficha.update({
    where: { id },
    data: { nome, dados: dados as unknown as Prisma.InputJsonValue },
  });

  revalidatePath(`${BASE}/${id}`);
  revalidatePath(BASE);
  return { ok: true };
}

// Excluir ficha — apenas o dono da ficha ou o dono do site.
export async function excluirFicha(formData: FormData) {
  const user = await usuarioAtual();
  const id = String(formData.get("id") ?? "");
  const ficha = await prisma.ficha.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!ficha) return;
  if (!user || (user.role !== "OWNER" && ficha.userId !== user.id)) return;

  await prisma.ficha.delete({ where: { id } });
  revalidatePath(BASE);
  redirect(BASE);
}
