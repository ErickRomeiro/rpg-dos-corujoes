"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { usuarioAtual, podeEditarFicha } from "@/lib/permissoes";
import { lerDados, pvMax } from "@/lib/ficha";

/**
 * Dano e cura direto do painel do mestre, sem passar pelo formulário.
 *
 * Existe porque o laço de combate é curto demais para o formulário: em luta o
 * PV muda a cada rodada, e abrir /editar, achar o campo e salvar não cabe
 * entre uma iniciativa e outra.
 *
 * NÃO grava no histórico da ficha, de propósito. O histórico serve para
 * edições da ficha — subir de nível, trocar equipamento, ganhar um talento —,
 * e um combate normal geraria dezenas de linhas de PV que afogariam
 * justamente o que interessa lembrar. O PV corrente continua visível na ficha
 * e no painel; é o rastro que importa aqui.
 */
export async function ajustarPv(formData: FormData) {
  const user = await usuarioAtual();
  const fichaId = String(formData.get("fichaId") ?? "");
  const mesaId = String(formData.get("mesaId") ?? "");
  const acao = String(formData.get("acao") ?? "");
  const quantidade = Number(formData.get("quantidade") ?? 0);

  if (acao !== "dano" && acao !== "cura") return;
  // Quantidade negativa viraria cura escrita como dano; é sempre um número
  // positivo, e quem escolhe o sinal é o botão.
  if (!Number.isFinite(quantidade) || quantidade <= 0) return;

  const ficha = await prisma.ficha.findUnique({
    where: { id: fichaId },
    select: { userId: true, dados: true },
  });
  if (!ficha) return;
  // A server action é uma rota própria: precisa checar permissão por conta,
  // sem depender de quem conseguiu abrir a tela que a chamou.
  if (!(await podeEditarFicha(user, ficha, fichaId))) return;

  const dados = lerDados(ficha.dados);
  const maximo = pvMax(dados);
  // Ficha que nunca registrou PV atual está inteira — é o único palpite
  // razoável, e é o que o jogador esperaria ao levar o primeiro golpe.
  const atual = dados.pvAtual ?? maximo;

  if (acao === "dano") {
    // Sem piso em zero: no 3.5 o personagem fica inconsciente e morrendo entre
    // -1 e -9, e morto em -10. Zerar aqui apagaria essa faixa.
    dados.pvAtual = atual - quantidade;
  } else {
    // Cura não passa do máximo. Só limita quando há um máximo conhecido —
    // ficha sem níveis de PV preenchidos daria máximo 0 e travaria a cura.
    const somado = atual + quantidade;
    dados.pvAtual = maximo > 0 ? Math.min(somado, maximo) : somado;
  }

  await prisma.ficha.update({
    where: { id: fichaId },
    data: { dados: dados as unknown as Prisma.InputJsonValue },
  });

  revalidatePath(`/dnd35/mestre/${mesaId}`);
  revalidatePath(`/dnd35/fichas/${fichaId}`);
}
