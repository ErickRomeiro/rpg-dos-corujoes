// Busca de usuários por nome (ou e-mail), para adicionar membros a uma mesa.
// Restrito: só quem pode gerenciar a mesa (dono ou mestre dela) pode buscar,
// e já exclui quem é membro daquela mesa.
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, podeGerenciarMesa } from "@/lib/permissoes";

export async function GET(req: NextRequest) {
  const user = await usuarioAtual();
  if (!user) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const mesaId = req.nextUrl.searchParams.get("mesaId") ?? "";

  if (!(await podeGerenciarMesa(user, mesaId))) {
    return NextResponse.json({ erro: "sem permissão" }, { status: 403 });
  }

  const membros = await prisma.membroMesa.findMany({
    where: { mesaId },
    select: { userId: true },
  });
  const idsExcluir = membros.map((m) => m.userId);

  const usuarios = await prisma.user.findMany({
    where: {
      ...(idsExcluir.length ? { id: { notIn: idsExcluir } } : {}),
      // Sem termo de busca, lista todos os adicionáveis (ao focar o campo).
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, email: true, image: true },
    take: 50,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(usuarios);
}
