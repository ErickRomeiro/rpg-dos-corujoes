import Link from "next/link";

type EmConstrucaoProps = {
  icone: string;
  titulo: string;
  descricao: string;
  /** Itens planejados para esta seção. */
  planejado?: string[];
};

/** Placeholder padrão para seções ainda não implementadas. */
export function EmConstrucao({
  icone,
  titulo,
  descricao,
  planejado,
}: EmConstrucaoProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <span aria-hidden className="text-5xl">
          {icone}
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{titulo}</h1>
        <p className="mx-auto mt-2 max-w-prose text-muted">{descricao}</p>

        <span className="mt-6 inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          Em construção
        </span>

        {planejado && planejado.length > 0 && (
          <div className="mx-auto mt-8 max-w-md text-left">
            <p className="text-sm font-medium text-foreground">
              O que vem por aqui:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {planejado.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-accent">
                    ▹
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/dnd35/compendio"
            className="text-sm font-medium text-accent hover:text-accent-strong"
          >
            Enquanto isso, explore o Compêndio →
          </Link>
        </div>
      </div>
    </div>
  );
}
