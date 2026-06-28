// Endpoint do Auth.js: trata login, logout, callbacks de OAuth e sessão.
// Todas as rotas ficam sob /api/auth/* (ex.: /api/auth/callback/google).
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
