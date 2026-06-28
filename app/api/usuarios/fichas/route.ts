// Lista as fichas (de D&D 3.5) de um usuário, para escolher qual entra na mesa.
// Restrito a quem pode gerenciar a mesa (dono ou mestre dela).
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, podeGerenciarMesa } from "@/lib/permissoes";

const SISTEMA = "dnd35";

export async function GET(req: NextRequest) {
  const user = await usuarioAtual();
  if (!user) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const mesaId = req.nextUrl.searchParams.get("mesaId") ?? "";
  const userId = req.nextUrl.searchParams.get("userId") ?? "";

  if (!(await podeGerenciarMesa(user, mesaId))) {
    return NextResponse.json({ erro: "sem permissão" }, { status: 403 });
  }
  if (!userId) return NextResponse.json([]);

  const fichas = await prisma.ficha.findMany({
    where: { userId, sistema: SISTEMA },
    select: { id: true, nome: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(fichas);
}
