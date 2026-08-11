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
  ajustarRetrato,
  enviarRetrato,
  removerRetrato,
  type EstadoFicha,
} from "@/app/dnd35/fichas/actions";

export function RetratoFicha({
  fichaId,
  retrato,
  retratoPos,
  nome,
}: {
  fichaId: string;
  retrato: string;
  retratoPos: number;
  nome: string;
}) {
  // A posição vive em estado local para a prévia acompanhar o dedo. O
  // salvamento só acontece ao SOLTAR o controle — salvar a cada pixel
  // arrastado renderia dezenas de gravações para um ajuste só.
  const [pos, setPos] = useState(retratoPos);
  const formPos = useRef<HTMLFormElement>(null);
  const [estado, acao, pendente] = useActionState<EstadoFicha, FormData>(
    enviarRetrato,
    undefined,
  );
  const entrada = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<HTMLFormElement | null>(null);

  return (
    <div className="flex flex-wrap items-start gap-4">
      {/* A prévia usa a MESMA proporção e o mesmo recorte da carta, senão o
          ajuste seria feito contra um enquadramento que não é o real. */}
      <div className="w-28 flex-none">
        <div className="aspect-[3/4] overflow-hidden rounded-lg border border-border bg-background">
          {retrato ? (
            // <img> e não next/image, como já é feito com os avatares do
            // Google: o arquivo vem de host externo e não precisa do otimizador.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={retrato}
              alt={`Retrato de ${nome}`}
              className="h-full w-full object-cover"
              style={{ objectPosition: `50% ${pos}%` }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-[11px] text-muted">
              sem retrato
            </div>
          )}
        </div>

        {retrato && (
          <form ref={formPos} action={ajustarRetrato} className="mt-2">
            <input type="hidden" name="id" value={fichaId} />
            <label className="block text-[10px] font-medium text-muted">
              Enquadramento
            </label>
            {/* O `name` vive no próprio controle, e não num campo escondido
                espelhando o estado: espelhar criava uma corrida — o envio
                dispara no soltar e lia o campo antes de o React ter gravado o
                valor novo nele, mandando o anterior. Aqui o que se envia é
                sempre o que está no controle. */}
            <input
              type="range"
              name="posicao"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              // Grava só ao soltar: a cada pixel arrastado seriam dezenas de
              // gravações para um ajuste só.
              onPointerUp={() => formPos.current?.requestSubmit()}
              onKeyUp={() => formPos.current?.requestSubmit()}
              aria-label="Enquadramento vertical do retrato"
              className="w-full accent-accent"
            />
          </form>
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
