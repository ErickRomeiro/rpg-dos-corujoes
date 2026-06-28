"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function BotaoEntrar() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  return (
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className="inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-strong"
    >
      <span aria-hidden className="text-lg">
        G
      </span>
      Entrar com Google
    </button>
  );
}

export default function EntrarPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <span aria-hidden className="text-6xl">
        🦉
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        RPG dos <span className="text-accent">Corujões</span>
      </h1>
      <p className="mt-3 text-muted">
        Faça login para acessar suas mesas, fichas e ferramentas.
      </p>

      <div className="mt-8">
        <Suspense
          fallback={
            <button
              disabled
              className="inline-flex items-center gap-3 rounded-full bg-surface-2 px-6 py-3 text-sm font-semibold text-muted"
            >
              Carregando…
            </button>
          }
        >
          <BotaoEntrar />
        </Suspense>
      </div>

      <p className="mt-8 text-xs text-muted">
        Ao entrar, você concorda em usar o site apenas para fins de jogo.
      </p>
    </div>
  );
}
