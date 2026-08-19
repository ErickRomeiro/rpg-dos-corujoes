"use client";

// Escolha de cor (olhos, cabelo, pele) mostrando a cor, e não só o nome dela.
//
// Não dá para fazer isso com <select>: dentro de <option> o navegador ignora
// praticamente todo estilo, e o pouco que aceita muda de sistema para sistema.
// Então é uma listbox própria — o que traz junto a obrigação de reimplementar
// à mão o que o <select> dava de graça: teclado, foco e fechar ao clicar fora.
//
// Assim como o `Selecao`, este campo NUNCA descarta o valor que já estava na
// ficha. Estes campos eram texto livre; uma ficha com "castanho esverdeado"
// escrito à mão continua válida e aparece marcada como fora da lista.

import { useEffect, useId, useRef, useState } from "react";
import { corPorNome, type OpcaoCor } from "@/lib/dnd35/aparencia";
import { inputCls } from "@/app/dnd35/fichas/_components/campos";

/** O quadradinho de cor. Sem cor (Calvo, ou valor livre) vira contorno vazio. */
function Amostra({ hex, titulo }: { hex?: string; titulo?: string }) {
  return (
    <span
      aria-hidden
      title={titulo}
      className={`h-4 w-4 flex-none rounded border ${
        hex ? "border-black/40" : "border-dashed border-muted/60"
      }`}
      style={hex ? { backgroundColor: hex } : undefined}
    />
  );
}

export function SelecaoCor({
  valor,
  aoMudar,
  opcoes,
  rotulo,
}: {
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: readonly OpcaoCor[];
  /** Para o leitor de tela saber de qual campo é esta lista. */
  rotulo: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [emFoco, setEmFoco] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);
  const idLista = useId();

  const escolhida = corPorNome(opcoes, valor);
  const foraDaLista = valor !== "" && !escolhida;

  // Fechar ao clicar fora. Sem isto a lista fica aberta atrás de outros campos.
  useEffect(() => {
    if (!aberto) return;
    const aoClicar = (e: MouseEvent) => {
      if (!caixa.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", aoClicar);
    return () => document.removeEventListener("mousedown", aoClicar);
  }, [aberto]);

  function abrir() {
    const atual = opcoes.findIndex((o) => o.nome === valor);
    setEmFoco(atual >= 0 ? atual : 0);
    setAberto(true);
  }

  function escolher(nome: string) {
    aoMudar(nome);
    setAberto(false);
  }

  function aoTeclar(e: React.KeyboardEvent) {
    if (!aberto) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setAberto(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setEmFoco((i) => Math.min(i + 1, opcoes.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setEmFoco((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setEmFoco(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setEmFoco(opcoes.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      escolher(opcoes[emFoco].nome);
    } else if (e.key === "Tab") {
      setAberto(false);
    }
  }

  return (
    <div ref={caixa} className="relative">
      <button
        type="button"
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={aoTeclar}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={rotulo}
        title={
          foraDaLista
            ? "Este valor veio da ficha e não está na lista — foi preservado."
            : undefined
        }
        className={`${inputCls} flex items-center gap-2 text-left ${
          foraDaLista ? "border-accent/60" : ""
        }`}
      >
        {valor ? (
          <>
            <Amostra hex={escolhida?.hex || undefined} />
            <span className="min-w-0 flex-1 truncate">{valor}</span>
            {foraDaLista && (
              <span className="flex-none text-[11px] text-muted">
                fora da lista
              </span>
            )}
          </>
        ) : (
          <span className="flex-1 text-muted">—</span>
        )}
        <span aria-hidden className="flex-none text-muted">
          ▾
        </span>
      </button>

      {aberto && (
        <ul
          id={idLista}
          role="listbox"
          aria-label={rotulo}
          // A lista cresce até caber o nome inteiro, em vez de herdar a largura
          // do campo: a coluna é estreita e cortava justamente os nomes que
          // precisam ser distinguidos ("Castanhos" e "Castanho-escuros" viravam
          // os dois "Cas…"). Nunca fica menor que o campo, nem maior que a tela.
          className="absolute z-20 mt-1 max-h-64 w-max min-w-full max-w-[15rem] overflow-y-auto rounded-lg border border-border bg-surface-2 py-1 shadow-xl"
        >
          <li>
            <button
              type="button"
              onClick={() => escolher("")}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-muted hover:bg-background"
            >
              — limpar
            </button>
          </li>

          {opcoes.map((o, i) => {
            const atual = o.nome === valor;
            return (
              <li key={o.nome} role="option" aria-selected={atual}>
                <button
                  type="button"
                  onClick={() => escolher(o.nome)}
                  onMouseEnter={() => setEmFoco(i)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                    i === emFoco ? "bg-background" : ""
                  } ${atual ? "font-medium text-accent" : ""}`}
                >
                  <Amostra hex={o.hex || undefined} />
                  <span className="truncate">{o.nome}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
