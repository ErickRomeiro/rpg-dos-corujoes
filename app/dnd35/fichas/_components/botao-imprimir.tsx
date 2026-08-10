"use client";

// Só existe porque `window.print()` precisa do navegador — a página da ficha
// em si é servidor puro, e o resto da impressão é CSS (`print:` no layout).

export function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent"
    >
      Imprimir
    </button>
  );
}
