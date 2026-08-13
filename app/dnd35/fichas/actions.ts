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
  lerEnquadramento,
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

/**
 * Retrato do personagem: envio, troca e remoção.
 *
 * O arquivo vai para o Vercel Blob e a ficha guarda só a URL. Não dá para
 * gravar em disco: em produção o sistema de arquivos é descartável, e o que
 * fosse salvo sumiria no próximo deploy.
 *
 * O que é validado aqui, e por quê:
 *
 *  - **Quem envia** — `podeEditarFicha`, a mesma regra do salvamento. Sem isso,
 *    qualquer pessoa logada poria imagem na ficha de qualquer outra.
 *  - **Tamanho** — teto de 4 MB. Retrato não precisa de mais, e sem teto uma
 *    conta enche o armazenamento sozinha.
 *  - **Tipo** — só imagem, e conferido pelo CONTEÚDO do arquivo (os primeiros
 *    bytes), não pelo nome nem pelo `type` que o navegador declara: os dois são
 *    escolhidos por quem envia e não provam nada.
 *
 * `addRandomSuffix` evita que dois envios com o mesmo nome se sobrescrevam, e
 * também impede adivinhar a URL do retrato de outra ficha a partir do id dela.
 */

const RETRATO_MAX_BYTES = 4 * 1024 * 1024;

/** Assinaturas de arquivo das imagens que aceitamos. */
const ASSINATURAS: { tipo: string; bytes: number[] }[] = [
  { tipo: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { tipo: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { tipo: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  // WEBP é "RIFF....WEBP": os 4 primeiros bytes bastam para separar do resto.
  { tipo: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

function tipoRealDaImagem(inicio: Uint8Array): string | null {
  for (const { tipo, bytes } of ASSINATURAS) {
    if (bytes.every((b, i) => inicio[i] === b)) return tipo;
  }
  return null;
}

export async function enviarRetrato(
  _prev: EstadoFicha,
  formData: FormData,
): Promise<EstadoFicha> {
  const id = String(formData.get("id") ?? "");
  const user = await usuarioAtual();

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    select: { userId: true, dados: true },
  });
  if (!ficha) return { erro: "Ficha não encontrada." };
  if (!(await podeEditarFicha(user, ficha, id))) {
    return { erro: "Você não pode editar esta ficha." };
  }

  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Escolha uma imagem." };
  }
  if (arquivo.size > RETRATO_MAX_BYTES) {
    return { erro: "A imagem passa de 4 MB. Envie uma menor." };
  }

  const conteudo = new Uint8Array(await arquivo.arrayBuffer());
  const tipo = tipoRealDaImagem(conteudo.subarray(0, 8));
  if (!tipo) {
    return { erro: "Arquivo não é uma imagem (aceito JPEG, PNG, GIF ou WEBP)." };
  }

  const dados = lerDados(ficha.dados);
  const anterior = dados.retrato;

  const { put, del } = await import("@vercel/blob");

  let url: string;
  try {
    const enviado = await put(`retratos/${id}`, Buffer.from(conteudo), {
      access: "public",
      contentType: tipo,
      addRandomSuffix: true,
    });
    url = enviado.url;
  } catch {
    // Falta de token é o caso comum aqui, e o erro cru do SDK não diz isso.
    return {
      erro:
        "Não consegui guardar a imagem. Confira se o armazenamento (BLOB_READ_WRITE_TOKEN) está configurado.",
    };
  }

  await prisma.ficha.update({
    where: { id },
    data: {
      dados: { ...dados, retrato: url } as unknown as Prisma.InputJsonValue,
    },
  });

  // O retrato antigo já não é alcançável pela ficha; apagá-lo evita acumular
  // arquivo órfão pago. Se falhar, o envio novo continua valendo.
  if (anterior) {
    try {
      await del(anterior);
    } catch {}
  }

  revalidatePath(`${BASE}/${id}`);
  revalidatePath(BASE);
  return { ok: true };
}

export async function removerRetrato(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await usuarioAtual();

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    select: { userId: true, dados: true },
  });
  if (!ficha) return;
  if (!(await podeEditarFicha(user, ficha, id))) return;

  const dados = lerDados(ficha.dados);
  if (!dados.retrato) return;

  await prisma.ficha.update({
    where: { id },
    data: {
      dados: { ...dados, retrato: "" } as unknown as Prisma.InputJsonValue,
    },
  });

  try {
    const { del } = await import("@vercel/blob");
    await del(dados.retrato);
  } catch {}

  revalidatePath(`${BASE}/${id}`);
  revalidatePath(BASE);
}

/**
 * Guarda o recorte do retrato — qual parte da imagem aparece, e com quanta
 * ampliação, em um dos dois quadros (carta ou miniatura).
 *
 * É ação própria, e não parte do "Salvar ficha", pelo mesmo motivo do envio: a
 * pessoa está olhando a imagem e ajustando até ficar bom, e ter de lembrar de
 * salvar depois quebraria esse laço.
 */
export async function ajustarRetrato(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await usuarioAtual();

  const ficha = await prisma.ficha.findUnique({
    where: { id },
    select: { userId: true, dados: true },
  });
  if (!ficha) return;
  if (!(await podeEditarFicha(user, ficha, id))) return;

  const alvo = String(formData.get("alvo") ?? "");
  if (alvo !== "carta" && alvo !== "mini") return;

  // Os números vêm de um controle na tela, mas a action é rota própria e pode
  // receber qualquer coisa — quem impõe as faixas é `lerEnquadramento`, o mesmo
  // que normaliza na leitura, e não o formulário.
  const enquadramento = lerEnquadramento({
    x: Number(formData.get("x")),
    y: Number(formData.get("y")),
    zoom: Number(formData.get("zoom")),
  });

  const dados = lerDados(ficha.dados);
  const campo = alvo === "carta" ? "retratoCarta" : "retratoMini";

  await prisma.ficha.update({
    where: { id },
    data: {
      dados: {
        ...dados,
        [campo]: enquadramento,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`${BASE}/${id}`);
}
