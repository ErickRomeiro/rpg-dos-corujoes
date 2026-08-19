import { Coruja } from "@/components/coruja";

export function Rodape() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-muted sm:px-6">
        <p className="flex items-center gap-1.5 font-medium text-foreground">
          RPG dos Corujões
          <Coruja className="h-4 w-4 shrink-0 text-accent" />
        </p>
        <p className="mt-1">
          Plataforma de ferramentas para RPGs de mesa. Projeto de fãs, sem fins
          lucrativos.
        </p>
      </div>
    </footer>
  );
}
