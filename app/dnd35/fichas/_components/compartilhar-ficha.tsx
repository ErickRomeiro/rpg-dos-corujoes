"use client";

// Painel do link público de leitura.
//
// É componente de cliente por causa do "copiar" — o resto é um formulário
// comum, que chama a server action e funciona mesmo sem JavaScript.

import { useState } from "react";
import { alternarCompartilhamento } from "@/app/dnd35/fichas/actions";

export function CompartilharFicha({
  fichaId,
  token,
}: {
  fichaId: string;
  /** Null = não compartilhada. */
  token: string | null;
}) {
  const [copiado, setCopiado] = useState(false);
  // Montado no cliente para pegar o host de onde o app está sendo servido —
  // localhost em desenvolvimento, o domínio de verdade em produção.
  const url =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/f/${token}`
      : null;

  return (
    <div className="rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">Compartilhar</h2>

      {!token ? (
        <>
          <p className="mt-1 text-xs text-muted">
            Gera um endereço secreto que abre esta ficha em leitura, sem login.
            Quem tiver o link vê — inclusive quem receber de repasse.
          </p>
          <form action={alternarCompartilhamento} className="mt-3">
            <input type="hidden" name="id" value={fichaId} />
            <input type="hidden" name="ligar" value="1" />
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent"
            >
              Gerar link público
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="mt-1 text-xs text-muted">
            Esta ficha está pública para quem tiver o endereço abaixo.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded bg-background/60 px-2 py-1.5 text-xs">
              {url ?? `/f/${token}`}
            </code>
            <button
              type="button"
              onClick={async () => {
                if (!url) return;
                await navigator.clipboard.writeText(url);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent"
            >
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
          <form action={alternarCompartilhamento} className="mt-3">
            <input type="hidden" name="id" value={fichaId} />
            <input type="hidden" name="ligar" value="0" />
            <button
              type="submit"
              className="text-xs font-medium text-red-400 transition-colors hover:text-red-300"
            >
              Revogar link
            </button>
          </form>
          <p className="mt-2 text-[11px] text-muted">
            Revogar derruba o endereço na hora. Gerar de novo cria outro — o
            antigo não volta a valer.
          </p>
        </>
      )}
    </div>
  );
}
