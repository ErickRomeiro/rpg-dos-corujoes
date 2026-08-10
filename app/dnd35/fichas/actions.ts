"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { usuarioAtual, podeEditarFicha } from "@/lib/permissoes";
import {
  dadosVazios,
  lerDados,
  nomeDoJogador,
  type DadosFicha,
} from "@/lib/ficha";
import { compararFicha } from "@/lib/ficha-historico";

const SISTEMA = "dnd35";
const BASE = `/${SISTEMA}/fichas`;

export type EstadoFicha = { erro?: string; ok?: boolean } | undefined;

/**
 * A ficha inteira chega como JSON num input escondido. Devolvemos o valor cru —
 * quem normaliza é `lerDados`, então JSON malformado ou adulterado vira uma
 * ficha vazia em vez de sujeira no banco.
 */
function jsonForm(formData: FormData, name: string): unknown {
  const v = String(formData.get(name) ?? "");
  if (!v) return undefined;
  try {
    return JSON.parse(v);
  } catch {
    return undefined;
  }
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

  // A ficha é de quem está logado, então "Jogador" já nasce preenchido — é o
  // único campo da identidade cuja resposta o app conhece de antemão. Continua
  // editável: mesa em que alguém joga com apelido não fica presa ao nome da
  // conta.
  const dados = { ...dadosVazios(), jogador: nomeDoJogador(user) };

  const ficha = await prisma.ficha.create({
    data: {
      userId: user.id,
      sistema: SISTEMA,
      nome,
      dados: dados as unknown as Prisma.InputJsonValue,
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
  if (!user) return { erro: "Faça login." };
  const id = String(formData.get("id") ?? "");

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    select: { userId: true, nome: true, dados: true },
  });
  if (!ficha) return { erro: "Ficha não encontrada." };
  if (!(await podeEditarFicha(user, ficha, id))) {
    return { erro: "Você não tem permissão para editar esta ficha." };
  }

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "O personagem precisa de um nome." };

  // `lerDados` é a mesma função que lê o JSON do banco, então o formato salvo
  // é sempre o canônico — e nada que venha do cliente entra sem normalização.
  const dados: DadosFicha = lerDados(jsonForm(formData, "dados"));

  // O antes também passa por `lerDados`: comparar o JSON cru contra o
  // normalizado acusaria como "mudança" toda diferença de formato que a
  // normalização conserta, e o histórico da primeira edição de uma ficha
  // antiga viria cheio de ruído que ninguém digitou.
  const mudancas = compararFicha(
    { nome: ficha.nome, dados: lerDados(ficha.dados) },
    { nome, dados },
  );

  await prisma.$transaction(async (tx) => {
    await tx.ficha.update({
      where: { id },
      data: { nome, dados: dados as unknown as Prisma.InputJsonValue },
    });
    // Salvar sem mexer em nada não vira linha no histórico.
    if (mudancas.length > 0) {
      await tx.alteracaoFicha.create({
        data: {
          fichaId: id,
          autorId: user.id,
          autorNome: nomeDoJogador(user),
          mudancas: mudancas as unknown as Prisma.InputJsonValue,
        },
      });
    }
  });

  revalidatePath(`${BASE}/${id}`);
  revalidatePath(BASE);
  return { ok: true };
}

/**
 * Liga ou desliga o link público de leitura.
 *
 * Quem pode compartilhar é só o DONO da ficha (ou o dono do site), e não todo
 * mundo que pode editar: um mestre corrige o PV de um jogador, mas expor o
 * personagem dele na internet aberta não é a mesma decisão.
 *
 * Revogar apaga o token. Gerar de novo cria outro, então o endereço antigo não
 * volta a valer — é o que faz a revogação ser de verdade.
 */
export async function alternarCompartilhamento(formData: FormData) {
  const user = await usuarioAtual();
  const id = String(formData.get("id") ?? "");
  const ligar = String(formData.get("ligar") ?? "") === "1";

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!ficha) return;
  if (!user || (user.role !== "OWNER" && ficha.userId !== user.id)) return;

  await prisma.ficha.update({
    where: { id },
    // 32 hex de crypto.randomUUID: não é adivinhável por tentativa, que é a
    // única defesa de um link sem login.
    data: {
      publicoToken: ligar ? randomUUID().replaceAll("-", "") : null,
    },
  });

  revalidatePath(`${BASE}/${id}`);
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
