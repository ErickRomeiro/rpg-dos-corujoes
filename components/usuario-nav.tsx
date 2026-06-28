"use client";

import { signIn, signOut, useSession } from "next-auth/react";

// Área do usuário no cabeçalho: botão de login (Google) quando deslogado,
// avatar/nome + sair quando logado.
export function UsuarioNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-surface-2" />;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-accent-strong"
      >
        Entrar
      </button>
    );
  }

  const { name, image } = session.user;
  const primeiroNome = name?.split(" ")[0] ?? "Aventureiro";

  return (
    <div className="flex items-center gap-2">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full border border-border"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-sm"
        >
          🦉
        </span>
      )}
      <span className="hidden text-sm font-medium sm:inline">
        {primeiroNome}
      </span>
      <button
        onClick={() => signOut()}
        className="rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        Sair
      </button>
    </div>
  );
}
