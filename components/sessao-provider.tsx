"use client";

import { SessionProvider } from "next-auth/react";

// Disponibiliza a sessão para componentes-cliente (useSession).
// Páginas estáticas continuam estáticas; a sessão é carregada no cliente.
export function SessaoProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
