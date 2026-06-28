// Configuração central do Auth.js (NextAuth v5).
// Login via Google, com sessões e usuários persistidos no PostgreSQL (Neon)
// através do adaptador Prisma.
//
// Papéis: o dono do site (OWNER) é reconhecido automaticamente pelo e-mail
// listado em OWNER_EMAILS; os demais entram como USER. O papel de
// mestre/jogador por campanha é tratado à parte (ver "authorization-model").
//
// Variáveis de ambiente esperadas (ver .env.example):
//   AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, DATABASE_URL, OWNER_EMAILS
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function emailsProprietarios(): string[] {
  return (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    // Sessões em banco: `user` é o registro do DB (inclui id e role).
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role =
          (user as { role?: "OWNER" | "USER" }).role ?? "USER";
      }
      return session;
    },
  },
  events: {
    // Ao criar a conta, promove a OWNER se o e-mail estiver em OWNER_EMAILS.
    async createUser({ user }) {
      const donos = emailsProprietarios();
      if (user.email && donos.includes(user.email.toLowerCase())) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "OWNER" },
        });
      }
    },
  },
});
