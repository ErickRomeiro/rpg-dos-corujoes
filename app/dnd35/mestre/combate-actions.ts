"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, podeGerenciarMesa } from "@/lib/permissoes";
import { lerDados, iniciativa } from "@/lib/ficha";
import {
  avancar,
  ordenar,
  rolarIniciativa,
  turnoAposRemover,
  turnoValido,
  voltar,
} from "@/lib/combate";

/**
 * Ações do rastreador de iniciativa.
 *
 * Todas passam pelo mesmo portão: quem chama precisa mestrar a mesa. Server
 * action é rota POST de verdade, alcançável fora da tela que a desenhou, então
 * a permissão é checada aqui e não só em quem conseguiu abrir o painel.
 */
async function mesaAutorizada(formData: FormData): Promise<string | null> {
  const mesaId = String(formData.get("mesaId") ?? "");
  if (!mesaId) return null;
  const user = await usuarioAtual();
  if (!(await podeGerenciarMesa(user, mesaId))) return null;
  return mesaId;
}

/** Combate da mesa com a fila já ordenada, ou null. */
async function combateDaMesa(mesaId: string) {
  const combate = await prisma.combate.findUnique({
    where: { mesaId },
    include: { participantes: true },
  });
  if (!combate) return null;
  return { ...combate, fila: ordenar(combate.participantes) };
}

/**
 * O combate ainda está sendo montado — rodada 1, ninguém passou a vez.
 *
 * Separa dois momentos que pedem respostas opostas quando a fila reordena.
 * Montando, o marcador deve ficar no topo: o mestre está cadastrando os
 * monstros e um bicho rápido que entra é o novo primeiro. Com a luta andando,
 * quem está no meio do turno tem de continuar nele, e quem chega atrasado
 * espera a vez — daí as ações seguirem o participante em vez do índice.
 */
function montando(combate: { rodada: number; turno: number }): boolean {
  return combate.rodada === 1 && combate.turno === 0;
}

function atualizar(mesaId: string) {
  revalidatePath(`/dnd35/mestre/${mesaId}`);
}

/**
 * Abre o combate já com os personagens da mesa na fila, iniciativa rolada.
 *
 * Rolar por todo mundo é o padrão porque é o caso comum em mesa remota; quem
 * rolou o próprio dado na mesa física corrige o número na linha, o que é mais
 * rápido do que preencher a fila inteira do zero.
 */
export async function iniciarCombate(formData: FormData) {
  const mesaId = await mesaAutorizada(formData);
  if (!mesaId) return;

  // Recomeçar por cima de um combate aberto apagaria a luta em andamento.
  if (await prisma.combate.findUnique({ where: { mesaId } })) return;

  const membros = await prisma.membroMesa.findMany({
    where: { mesaId, papel: "JOGADOR", NOT: { fichaId: null } },
    include: { ficha: { select: { id: true, nome: true, dados: true } } },
    orderBy: { createdAt: "asc" },
  });

  const participantes = membros
    .filter((m) => m.ficha)
    .map((m, i) => {
      const dados = lerDados(m.ficha!.dados);
      const mod = iniciativa(dados);
      return {
        fichaId: m.ficha!.id,
        nome: m.ficha!.nome,
        modIniciativa: mod,
        iniciativa: rolarIniciativa(mod),
        ordem: i,
      };
    });

  await prisma.combate.create({
    data: { mesaId, participantes: { create: participantes } },
  });

  atualizar(mesaId);
}

/** Encerra e apaga o combate. A fila não sobrevive ao fim da luta. */
export async function encerrarCombate(formData: FormData) {
  const mesaId = await mesaAutorizada(formData);
  if (!mesaId) return;
  await prisma.combate.deleteMany({ where: { mesaId } });
  atualizar(mesaId);
}

export async function avancarTurno(formData: FormData) {
  const mesaId = await mesaAutorizada(formData);
  if (!mesaId) return;
  const combate = await combateDaMesa(mesaId);
  if (!combate) return;

  const { turno, rodada } = avancar(
    combate.turno,
    combate.rodada,
    combate.fila.length,
  );
  await prisma.combate.update({
    where: { id: combate.id },
    data: { turno, rodada },
  });
  atualizar(mesaId);
}

export async function voltarTurno(formData: FormData) {
  const mesaId = await mesaAutorizada(formData);
  if (!mesaId) return;
  const combate = await combateDaMesa(mesaId);
  if (!combate) return;

  const { turno, rodada } = voltar(
    combate.turno,
    combate.rodada,
    combate.fila.length,
  );
  await prisma.combate.update({
    where: { id: combate.id },
    data: { turno, rodada },
  });
  atualizar(mesaId);
}

/**
 * Corrige a iniciativa de quem já está na fila.
 *
 * Mexer no valor reordena a fila sob os pés do turno atual. Em vez de deixar o
 * índice apontando para outro personagem, guardamos quem estava agindo e
 * recolocamos o índice na posição nova dele — quem está no meio do turno
 * continua no meio do turno.
 */
export async function definirIniciativa(formData: FormData) {
  const mesaId = await mesaAutorizada(formData);
  if (!mesaId) return;
  const participanteId = String(formData.get("participanteId") ?? "");
  const valor = Number(formData.get("iniciativa"));
  if (!Number.isFinite(valor)) return;

  const combate = await combateDaMesa(mesaId);
  if (!combate) return;
  if (!combate.fila.some((p) => p.id === participanteId)) return;

  const agindoId = combate.fila[turnoValido(combate.turno, combate.fila.length)]?.id;

  const atualizados = combate.participantes.map((p) =>
    p.id === participanteId ? { ...p, iniciativa: Math.trunc(valor) } : p,
  );
  const novoIndice = ordenar(atualizados).findIndex((p) => p.id === agindoId);

  await prisma.$transaction([
    prisma.participanteCombate.update({
      where: { id: participanteId },
      data: { iniciativa: Math.trunc(valor) },
    }),
    prisma.combate.update({
      where: { id: combate.id },
      data: { turno: montando(combate) || novoIndice < 0 ? 0 : novoIndice },
    }),
  ]);

  atualizar(mesaId);
}

/** Monstro ou NPC entra na luta. PV é opcional — nem todo avulso precisa dele. */
export async function adicionarAvulso(formData: FormData) {
  const mesaId = await mesaAutorizada(formData);
  if (!mesaId) return;

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return;
  const valorIniciativa = Number(formData.get("iniciativa"));
  const pv = Number(formData.get("pv"));

  const combate = await combateDaMesa(mesaId);
  if (!combate) return;

  const temPv = Number.isFinite(pv) && pv > 0;
  // Entra no fim da ordem de chegada; a fila em si é reordenada por iniciativa.
  const ordem = combate.participantes.length
    ? Math.max(...combate.participantes.map((p) => p.ordem)) + 1
    : 0;

  const agindoId = combate.fila[turnoValido(combate.turno, combate.fila.length)]?.id;
  const novo = {
    id: "novo",
    iniciativa: Number.isFinite(valorIniciativa) ? Math.trunc(valorIniciativa) : 0,
    modIniciativa: 0,
    ordem,
  };
  const novoIndice = ordenar([...combate.participantes, novo]).findIndex(
    (p) => p.id === agindoId,
  );

  await prisma.$transaction([
    prisma.participanteCombate.create({
      data: {
        combateId: combate.id,
        nome,
        iniciativa: novo.iniciativa,
        ordem,
        pvAtual: temPv ? Math.trunc(pv) : null,
        pvMax: temPv ? Math.trunc(pv) : null,
      },
    }),
    prisma.combate.update({
      where: { id: combate.id },
      data: { turno: montando(combate) || novoIndice < 0 ? 0 : novoIndice },
    }),
  ]);

  atualizar(mesaId);
}

/** Tira alguém da luta — morreu, fugiu, ou entrou por engano. */
export async function removerParticipante(formData: FormData) {
  const mesaId = await mesaAutorizada(formData);
  if (!mesaId) return;
  const participanteId = String(formData.get("participanteId") ?? "");

  const combate = await combateDaMesa(mesaId);
  if (!combate) return;
  const indice = combate.fila.findIndex((p) => p.id === participanteId);
  if (indice < 0) return;

  const turno = turnoAposRemover(combate.turno, indice, combate.fila.length);

  await prisma.$transaction([
    prisma.participanteCombate.delete({ where: { id: participanteId } }),
    prisma.combate.update({ where: { id: combate.id }, data: { turno } }),
  ]);

  atualizar(mesaId);
}

/**
 * Dano e cura do avulso, que não tem ficha onde guardar PV.
 *
 * Espelha de propósito as regras do `ajustarPv` das fichas: dano não trava em
 * zero, porque a faixa negativa é o que diz se está morrendo ou morto, e cura
 * não passa do máximo.
 */
export async function ajustarPvAvulso(formData: FormData) {
  const mesaId = await mesaAutorizada(formData);
  if (!mesaId) return;

  const participanteId = String(formData.get("participanteId") ?? "");
  const acao = String(formData.get("acao") ?? "");
  const quantidade = Number(formData.get("quantidade") ?? 0);
  if (acao !== "dano" && acao !== "cura") return;
  if (!Number.isFinite(quantidade) || quantidade <= 0) return;

  const participante = await prisma.participanteCombate.findUnique({
    where: { id: participanteId },
    include: { combate: { select: { mesaId: true } } },
  });
  // Confere que o participante é mesmo da mesa autorizada: o id vem do
  // formulário, e nada impede alguém de mandar o de outra mesa.
  if (!participante || participante.combate.mesaId !== mesaId) return;
  if (participante.fichaId) return; // personagem usa o PV da ficha
  if (participante.pvAtual == null) return;

  const maximo = participante.pvMax ?? 0;
  const atual = participante.pvAtual;
  const pvAtual =
    acao === "dano"
      ? atual - Math.trunc(quantidade)
      : maximo > 0
        ? Math.min(atual + Math.trunc(quantidade), maximo)
        : atual + Math.trunc(quantidade);

  await prisma.participanteCombate.update({
    where: { id: participanteId },
    data: { pvAtual },
  });

  atualizar(mesaId);
}
