// Helpers de autenticação/autorização (lado servidor).
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type UsuarioSessao = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "OWNER" | "USER";
};

/** Usuário logado atual (ou null). Lê a sessão do Auth.js. */
export async function usuarioAtual(): Promise<UsuarioSessao | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role,
  };
}

/** Dono do site (acesso global a tudo). */
export function ehDono(user: { role?: string } | null | undefined): boolean {
  return user?.role === "OWNER";
}

/**
 * Pode gerenciar (configurar) a mesa: o dono do site OU um mestre daquela mesa.
 */
export async function podeGerenciarMesa(
  user: UsuarioSessao | null,
  mesaId: string,
): Promise<boolean> {
  if (!user) return false;
  if (user.role === "OWNER") return true;
  const membro = await prisma.membroMesa.findUnique({
    where: { mesaId_userId: { mesaId, userId: user.id } },
    select: { papel: true },
  });
  return membro?.papel === "MESTRE";
}
