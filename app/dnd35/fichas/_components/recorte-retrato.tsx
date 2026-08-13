"use client";

// Recorte por seleção, como no Photoshop e no recorte de foto do celular: a
// imagem INTEIRA fica à vista, escurecida, e um quadro claro por cima marca o
// que vai aparecer. Arrastar o quadro escolhe a região; puxar um canto muda o
// quanto se aproxima.
//
// A versão anterior mostrava só a parte recortada e movia a imagem por trás de
// uma janela fixa. Funcionava, mas escondia justamente a informação de que se
// precisa para decidir: o que está ficando de fora. Aqui os dois lados da
// escolha aparecem ao mesmo tempo — o que entra, claro, e o que sai, escuro.
//
// O quadro tem a proporção do destino real (a carta é alta, a miniatura é
// quadrada) e ela é TRAVADA: não existe recorte possível que deforme a imagem
// ou deixe faixa vazia no destino.
//
// O que se guarda continua sendo `Enquadramento` (centro + ampliação), e não o
// retângulo: quem desenha o retrato são componentes de servidor, que aplicam
// `object-position` e `scale` direto no CSS. Retângulo e enquadramento são a
// mesma informação em duas linguagens, e a tradução mora logo abaixo.

import { useRef, useState } from "react";
import { ajustarRetrato } from "@/app/dnd35/fichas/actions";
import type { Enquadramento } from "@/lib/ficha";

/** Retângulo de recorte, em frações da imagem: 0 a 1 em cada eixo. */
type Retangulo = { l: number; t: number; w: number; h: number };

type Canto = "cima-esq" | "cima-dir" | "baixo-esq" | "baixo-dir";

const limitar = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const arred = (v: number, casas: number) => Number(v.toFixed(casas));

/**
 * Maior recorte que cabe na imagem, em fração da largura dela.
 *
 * É o recorte de ampliação 1: ou a largura inteira, quando a imagem é mais
 * "magra" que o quadro de destino, ou só o tanto que a altura comporta, quando
 * é mais larga. Serve de teto para o quadro e é o que faz a ampliação nunca
 * poder ser menor que 1.
 */
function larguraMaxima(aspectoImagem: number, aspectoQuadro: number) {
  return Math.min(1, aspectoQuadro / aspectoImagem);
}

/** A altura nunca é livre: sai da largura, porque a proporção é travada. */
function alturaDe(w: number, aspectoImagem: number, aspectoQuadro: number) {
  return (w * aspectoImagem) / aspectoQuadro;
}

/** Enquadramento guardado → retângulo na tela. */
function retanguloDe(
  e: Enquadramento,
  aspectoImagem: number,
  aspectoQuadro: number,
): Retangulo {
  const max = larguraMaxima(aspectoImagem, aspectoQuadro);
  const w = limitar(max / e.zoom, max / 4, max);
  const h = alturaDe(w, aspectoImagem, aspectoQuadro);
  // `x`/`y` são a posição na SOBRA — o quanto da imagem não cabe no recorte —,
  // que é exatamente como o `object-position` do CSS lê uma porcentagem.
  return { w, h, l: (e.x / 100) * (1 - w), t: (e.y / 100) * (1 - h) };
}

/** Retângulo na tela → enquadramento guardado. */
function enquadramentoDe(
  r: Retangulo,
  aspectoImagem: number,
  aspectoQuadro: number,
): Enquadramento {
  const max = larguraMaxima(aspectoImagem, aspectoQuadro);
  // Sem sobra num eixo, não há posição a escolher nele: o recorte já pega a
  // imagem de ponta a ponta, e qualquer valor daria o mesmo resultado. 50
  // mantém o registro no padrão em vez de guardar um número sem sentido — e
  // evita a divisão por zero logo abaixo.
  const semSobraX = 1 - r.w < 1e-6;
  const semSobraY = 1 - r.h < 1e-6;
  return {
    x: semSobraX ? 50 : arred((r.l / (1 - r.w)) * 100, 1),
    y: semSobraY ? 50 : arred((r.t / (1 - r.h)) * 100, 1),
    zoom: arred(max / r.w, 3),
  };
}

/** Move o quadro inteiro, sem deixá-lo sair da imagem. */
function movido(b: Retangulo, dx: number, dy: number): Retangulo {
  return {
    ...b,
    l: limitar(b.l + dx, 0, 1 - b.w),
    t: limitar(b.t + dy, 0, 1 - b.h),
  };
}

/**
 * Redimensiona pelo canto puxado, com o canto OPOSTO ancorado — ele não sai do
 * lugar, e é isso que faz o gesto parecer esticar a seleção em vez de
 * arrastá-la.
 *
 * Como a proporção é travada, um canto tem dois eixos para informar uma medida
 * só. A largura nova é a MÉDIA do que cada eixo pede: puxado na diagonal, que é
 * o gesto natural, os dois concordam e o quadro acompanha o dedo; puxado só na
 * horizontal ou só na vertical, anda pela metade, o que dá ajuste fino de
 * graça. Escolher um eixo só faria o quadro pular quando o gesto trocasse de
 * eixo no meio do caminho.
 */
function redimensionado(
  b: Retangulo,
  canto: Canto,
  dx: number,
  dy: number,
  aspectoImagem: number,
  aspectoQuadro: number,
): Retangulo {
  const direita = canto === "cima-dir" || canto === "baixo-dir";
  const baixo = canto === "baixo-esq" || canto === "baixo-dir";

  const ancoraX = direita ? b.l : b.l + b.w;
  const ancoraY = baixo ? b.t : b.t + b.h;

  const porX = b.w + (direita ? dx : -dx);
  const porY =
    b.w + ((baixo ? dy : -dy) * aspectoQuadro) / aspectoImagem;

  // Teto duplo: a ampliação mínima (o recorte inteiro) e o espaço que ainda
  // existe entre a âncora e a borda da imagem. Impor o segundo aqui, e não
  // depois, é o que impede o quadro de escorregar para o lado quando o gesto
  // continua depois de a seleção já ter encostado na borda.
  const max = larguraMaxima(aspectoImagem, aspectoQuadro);
  const espacoX = direita ? 1 - ancoraX : ancoraX;
  const espacoY = baixo ? 1 - ancoraY : ancoraY;
  const teto = Math.min(max, espacoX, (espacoY * aspectoQuadro) / aspectoImagem);

  const w = limitar((porX + porY) / 2, max / 4, teto);
  const h = alturaDe(w, aspectoImagem, aspectoQuadro);

  return {
    w,
    h,
    l: direita ? ancoraX : ancoraX - w,
    t: baixo ? ancoraY : ancoraY - h,
  };
}

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
  /** Proporção do quadro de destino: 3/4 para a carta, 1 para a miniatura. */
  proporcao: number;
  titulo: string;
  descricao: string;
}) {
  // A imagem só pode virar retângulo depois de carregada: antes disso não se
  // sabe a proporção dela, e é a proporção que decide o tamanho do recorte.
  const [aspecto, setAspecto] = useState<number | null>(null);
  const [ret, setRet] = useState<Retangulo | null>(null);

  const form = useRef<HTMLFormElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const arrasto = useRef<{
    modo: "mover" | Canto;
    px: number;
    py: number;
    base: Retangulo;
  } | null>(null);

  /**
   * Mede a imagem, uma vez só.
   *
   * Chamada pelo `ref` E pelo `onLoad` porque as duas cobrem casos diferentes:
   * imagem já em cache chega pronta na montagem e não dispara `load`; imagem
   * ainda baixando chega com `naturalWidth` zerado e só o `load` avisa.
   */
  function medir(img: HTMLImageElement | null) {
    if (!img || !img.naturalWidth || aspecto !== null) return;
    const a = img.naturalWidth / img.naturalHeight;
    setAspecto(a);
    setRet(retanguloDe(inicial, a, proporcao));
  }

  function salvar() {
    form.current?.requestSubmit();
  }

  function comecar(e: React.PointerEvent, modo: "mover" | Canto) {
    if (!ret) return;
    // As alças ficam DENTRO do quadro, então o evento delas sobe até ele. Sem
    // parar aqui, o "mover" do quadro sobrescreveria o "redimensionar" da alça
    // e puxar um canto sairia arrastando a seleção inteira.
    e.stopPropagation();
    arrasto.current = { modo, px: e.clientX, py: e.clientY, base: ret };
    // A captura fica na ÁREA, e não no canto que foi pressionado: o ponteiro
    // sai de cima do canto no primeiro pixel de movimento, e sem isso o gesto
    // morreria ali.
    area.current?.setPointerCapture(e.pointerId);
  }

  function mover(e: React.PointerEvent) {
    const a = arrasto.current;
    const caixa = area.current?.getBoundingClientRect();
    if (!a || !caixa || aspecto == null) return;

    const dx = (e.clientX - a.px) / caixa.width;
    const dy = (e.clientY - a.py) / caixa.height;

    setRet(
      a.modo === "mover"
        ? movido(a.base, dx, dy)
        : redimensionado(a.base, a.modo, dx, dy, aspecto, proporcao),
    );
  }

  function terminar(e: React.PointerEvent) {
    if (!arrasto.current) return;
    arrasto.current = null;
    if (area.current?.hasPointerCapture(e.pointerId)) {
      area.current.releasePointerCapture(e.pointerId);
    }
    // Grava só ao SOLTAR: a cada pixel arrastado seriam dezenas de gravações
    // para um ajuste só.
    salvar();
  }

  /** O controle deslizante mexe no tamanho mantendo o CENTRO do quadro. */
  function aoAmpliar(z: number) {
    if (!ret || aspecto == null) return;
    const max = larguraMaxima(aspecto, proporcao);
    const w = limitar(max / z, max / 4, max);
    const h = alturaDe(w, aspecto, proporcao);
    const cx = ret.l + ret.w / 2;
    const cy = ret.t + ret.h / 2;
    setRet({
      w,
      h,
      l: limitar(cx - w / 2, 0, 1 - w),
      t: limitar(cy - h / 2, 0, 1 - h),
    });
  }

  const enq = ret && aspecto != null ? enquadramentoDe(ret, aspecto, proporcao) : inicial;

  function canto(nome: Canto, posicao: string, cursor: string) {
    return (
      <span
        onPointerDown={(e) => comecar(e, nome)}
        // A alça visível é pequena para não tapar a imagem, mas a área que
        // responde ao toque é bem maior — dedo não acerta 12px.
        className={`absolute flex h-7 w-7 items-center justify-center ${posicao} ${cursor}`}
      >
        <span className="h-3 w-3 rounded-sm border border-black/50 bg-ouro" />
      </span>
    );
  }

  return (
    <div className="w-full max-w-[14rem]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {titulo}
      </p>

      <div
        ref={area}
        style={aspecto ? { aspectRatio: aspecto } : undefined}
        className="relative mt-1 w-full touch-none overflow-hidden rounded-lg border border-border bg-background"
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerCancel={terminar}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={medir}
          onLoad={(e) => medir(e.currentTarget)}
          src={src}
          alt={`Retrato de ${nome}`}
          draggable={false}
          className="pointer-events-none h-full w-full select-none object-cover"
        />

        {ret && (
          <div
            onPointerDown={(e) => comecar(e, "mover")}
            style={{
              left: `${ret.l * 100}%`,
              top: `${ret.t * 100}%`,
              width: `${ret.w * 100}%`,
              height: `${ret.h * 100}%`,
              // O escurecimento do resto é a SOMBRA deste quadro, esticada até
              // cobrir qualquer tamanho de área. Sai mais simples que quatro
              // divs em volta, e nunca deixa fresta nas quinas.
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            }}
            className="absolute cursor-move border border-ouro"
          >
            {canto("cima-esq", "-left-3.5 -top-3.5", "cursor-nwse-resize")}
            {canto("cima-dir", "-right-3.5 -top-3.5", "cursor-nesw-resize")}
            {canto("baixo-esq", "-bottom-3.5 -left-3.5", "cursor-nesw-resize")}
            {canto("baixo-dir", "-bottom-3.5 -right-3.5", "cursor-nwse-resize")}
          </div>
        )}
      </div>

      <form ref={form} action={ajustarRetrato} className="mt-2">
        <input type="hidden" name="id" value={fichaId} />
        <input type="hidden" name="alvo" value={alvo} />
        {/* O que viaja é o enquadramento, não o retângulo: é o formato que a
            ficha guarda e que o servidor sabe desenhar. */}
        <input type="hidden" name="x" value={enq.x} />
        <input type="hidden" name="y" value={enq.y} />
        <input type="hidden" name="zoom" value={enq.zoom} />

        {/* O deslizante faz o mesmo que puxar um canto, e existe por quem não
            arrasta: com ele a ampliação chega pelo teclado. */}
        <label className="block text-[10px] font-medium text-muted">
          Aproximar
        </label>
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={enq.zoom}
          disabled={!ret}
          onChange={(e) => aoAmpliar(Number(e.target.value))}
          onPointerUp={salvar}
          onKeyUp={salvar}
          aria-label={`Aproximação do retrato (${titulo})`}
          className="w-full accent-accent disabled:opacity-40"
        />
      </form>

      <p className="mt-1 text-[11px] leading-snug text-muted">{descricao}</p>
    </div>
  );
}
