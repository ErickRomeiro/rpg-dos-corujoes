// Aumenta os tipos do Auth.js para incluir o id e o papel global do usuário
// na sessão (expostos no callback `session` em auth.ts).
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "OWNER" | "USER";
    } & DefaultSession["user"];
  }
}
