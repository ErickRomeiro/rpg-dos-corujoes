"use client";

// Envio do retrato do personagem.
//
// Fica FORA do formulário da ficha, e não dentro dele, por dois motivos. O
// formulário manda a ficha inteira como um JSON só, e arquivo não cabe nesse
// desenho. E o envio precisa acontecer na hora: quem escolhe uma imagem espera
// vê-la, não descobrir depois de salvar a ficha inteira que ela foi recusada
// por tamanho.
//
// Por isso é um formulário próprio, com ação própria, e a página recarrega o
// que mudou por conta do `revalidatePath` na action.

import { useActionState, useRef, useState } from "react";
import {
  enviarRetrato,
  removerRetrato,
  type EstadoFicha,
} from "@/app/dnd35/fichas/actions";

export function RetratoFicha({
  fichaId,
  retrato,
  nome,
}: {
  fichaId: string;
  retrato: string;
  nome: string;
}) {
  const [estado, acao, pendente] = useActionState<EstadoFicha, FormData>(
    enviarRetrato,
    undefined,
  );
  const entrada = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<HTMLFormElement | null>(null);

  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="h-28 w-28 flex-none overflow-hidden rounded-lg border border-border bg-background">
        {retrato ? (
          // <img> e não next/image, como já é feito com os avatares do Google:
          // o arquivo vem de host externo e não precisa do otimizador.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={retrato}
            alt={`Retrato de ${nome}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-[11px] text-muted">
            sem retrato
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <form ref={setForm} action={acao}>
          <input type="hidden" name="id" value={fichaId} />
          <input
            ref={entrada}
            type="file"
            name="arquivo"
            accept="image/jpeg,image/png,image/gif,image/webp"
            // Envia assim que a pessoa escolhe: um botão "enviar" separado só
            // acrescentaria um passo, já que escolher arquivo já é a decisão.
            onChange={() => form?.requestSubmit()}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-background hover:file:bg-accent-strong"
          />
        </form>

        <p className="mt-2 text-[11px] text-muted">
          JPEG, PNG, GIF ou WEBP, até 4 MB.
        </p>

        {pendente && <p className="mt-1 text-xs text-muted">Enviando…</p>}

        {estado?.erro && (
          <p className="mt-1 text-xs text-red-400">{estado.erro}</p>
        )}

        {retrato && !pendente && (
          <form action={removerRetrato} className="mt-2">
            <input type="hidden" name="id" value={fichaId} />
            <button
              type="submit"
              className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-red-400"
            >
              Remover retrato
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
