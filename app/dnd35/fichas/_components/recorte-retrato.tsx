"use client";

// Recorte de imagem no quadro, como o do celular: arrasta para escolher a
// parte que aparece, amplia para chegar mais perto. A imagem SEMPRE preenche o
// quadro — não há posição possível que deixe faixa vazia, porque o que se move
// é o recorte, não a imagem dentro de uma moldura maior.
//
// A prévia tem a proporção do destino real (a carta é alta, a miniatura é
// quadrada). Ajustar contra um quadro de outra forma é ajustar contra um
// enquadramento que não é o que vai aparecer.

import { useRef, useState } from "react";
import { ajustarRetrato } from "@/app/dnd35/fichas/actions";
import { estiloRecorte, type Enquadramento } from "@/lib/ficha";

export function RecorteRetrato({
  fichaId,
  alvo,
  src,
  nome,
  inicial,
  proporcao,
  titulo,
  descricao,
}: {
  fichaId: string;
  /** Qual dos dois quadros este controle ajusta. */
  alvo: "carta" | "mini";
  src: string;
  nome: string;
  inicial: Enquadramento;
  /** Proporção do quadro real, em CSS (`3 / 4`, `1 / 1`). */
  proporcao: string;
  titulo: string;
  descricao: string;
}) {
  const [enq, setEnq] = useState<Enquadramento>(inicial);
  const form = useRef<HTMLFormElement>(null);
  const quadro = useRef<HTMLDivElement>(null);
  // Onde o ponteiro estava no movimento anterior. Null = não está arrastando.
  const ultimo = useRef<{ x: number; y: number } | null>(null);

  function salvar() {
    form.current?.requestSubmit();
  }

  function aoArrastar(ex: number, ey: number) {
    const caixa = quadro.current?.getBoundingClientRect();
    const anterior = ultimo.current;
    if (!caixa || !anterior) return;

    // Percorrer o quadro inteiro varre a faixa inteira de 0 a 100. Dividir pelo
    // zoom mantém o gesto com a mesma "velocidade" aparente: ampliado, a mesma
    // distância de dedo precisa mover menos da imagem para andar o mesmo tanto
    // na tela.
    const dx = ((ex - anterior.x) / caixa.width / enq.zoom) * 100;
    const dy = ((ey - anterior.y) / caixa.height / enq.zoom) * 100;
    ultimo.current = { x: ex, y: ey };

    setEnq((a) => ({
      ...a,
      // Sinal invertido: arrastar para a direita traz o que estava à esquerda,
      // como empurrar a foto por baixo de uma janela.
      x: Math.min(100, Math.max(0, a.x - dx)),
      y: Math.min(100, Math.max(0, a.y - dy)),
    }));
  }

  return (
    <div className="w-full max-w-[13rem]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {titulo}
      </p>

      <div
        ref={quadro}
        style={{ aspectRatio: proporcao }}
        className="relative mt-1 w-full cursor-grab touch-none overflow-hidden rounded-lg border border-border bg-background active:cursor-grabbing"
        onPointerDown={(e) => {
          ultimo.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (ultimo.current) aoArrastar(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          ultimo.current = null;
          e.currentTarget.releasePointerCapture(e.pointerId);
          salvar();
        }}
        onPointerCancel={() => {
          ultimo.current = null;
          salvar();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Retrato de ${nome}`}
          draggable={false}
          className="pointer-events-none h-full w-full select-none object-cover"
          style={estiloRecorte(enq)}
        />
      </div>

      <form ref={form} action={ajustarRetrato} className="mt-2">
        <input type="hidden" name="id" value={fichaId} />
        <input type="hidden" name="alvo" value={alvo} />
        {/* Os valores viajam em campos escondidos porque o que o controle
            deslizante edita é só o zoom; x e y vêm do arrasto. */}
        <input type="hidden" name="x" value={enq.x} />
        <input type="hidden" name="y" value={enq.y} />
        <input type="hidden" name="zoom" value={enq.zoom} />

        <label className="block text-[10px] font-medium text-muted">
          Aproximar
        </label>
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={enq.zoom}
          onChange={(e) => setEnq((a) => ({ ...a, zoom: Number(e.target.value) }))}
          // Grava só ao soltar: a cada passo do controle seriam dezenas de
          // gravações para um ajuste só.
          onPointerUp={salvar}
          onKeyUp={salvar}
          aria-label={`Aproximação do retrato (${titulo})`}
          className="w-full accent-accent"
        />
      </form>

      <p className="mt-1 text-[11px] leading-snug text-muted">{descricao}</p>
    </div>
  );
}
