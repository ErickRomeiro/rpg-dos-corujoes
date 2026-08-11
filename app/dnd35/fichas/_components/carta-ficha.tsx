// A ficha como carta de personagem.
//
// É a terceira tela a mostrar os mesmos dados, depois do formulário e da
// leitura, e cada uma serve um gesto diferente: o formulário é para preencher,
// a leitura é para conferir e imprimir, e a carta é para MOSTRAR — no grupo,
// na mesa, para quem não vai ler uma ficha inteira.
//
// Como nas outras, o que NÃO se duplica é o cálculo: todo número sai das mesmas
// funções de lib/ficha.ts, então as três não têm como divergir.
//
// O MAPA DOS ÍCONES
//
// A referência que originou esta tela é de outro sistema, e por isso serve como
// tratamento visual, não como escolha de dados. Cada ícone dela virou o número
// do 3.5 que significa a mesma coisa:
//
//   punho     → ataque corpo a corpo   (era "força/luta")
//   raio      → iniciativa             (era "velocidade")
//   escudo    → classe de armadura     (era "defesa")
//   estrela   → nível total            (era a graduação do personagem)
//   arco      → ataque à distância     (era a bomba, o ataque não corporal)
//   coração   → pontos de vida         (era a vitalidade)
//
// As três resistências não têm ícone na referência, mas em 3.5 são decisivas
// demais para ficar de fora — entram numa linha própria, com nome escrito.
//
// Não há campo de frase de efeito na ficha, e não inventei um: a referência tem
// uma, esta carta não. Preencher com texto genérico seria pior que a ausência.

import {
  ataqueCorpo,
  ataqueDistancia,
  ca,
  formatarMod,
  fortitude,
  iniciativa,
  nivelTotal,
  pvMax,
  reflexos,
  tamanhoPor,
  vontade,
  type DadosFicha,
} from "@/lib/ficha";

const vazio = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "");

/** Chip de número com ícone, no formato dos da referência. */
function Chip({
  icone,
  rotulo,
  valor,
  cor,
}: {
  icone: string;
  rotulo: string;
  valor: string;
  cor: "ataque" | "agil" | "defesa";
}) {
  const fundo = {
    ataque: "bg-amber-500/90 text-black",
    agil: "bg-accent text-background",
    defesa: "bg-emerald-500/90 text-black",
  }[cor];

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${fundo}`}
      title={rotulo}
    >
      <span aria-hidden className="text-lg leading-none">
        {icone}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[9px] font-semibold uppercase tracking-wider opacity-80">
          {rotulo}
        </span>
        <span className="text-lg font-bold tabular-nums">{valor}</span>
      </span>
    </div>
  );
}

/** Bloco de texto da carta: talentos, habilidades. */
function Bloco({
  titulo,
  itens,
}: {
  titulo: string;
  itens: { nome: string; notas: string }[];
}) {
  if (itens.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-bold">{titulo}</h3>
      <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">
        {itens.map((i) => i.nome).join(" · ")}
      </p>
    </div>
  );
}

export function CartaFicha({
  nome,
  dados,
}: {
  nome: string;
  dados: DadosFicha;
}) {
  const nivel = nivelTotal(dados);
  const pv = pvMax(dados);
  const pvAtual = dados.pvAtual;

  // "12 / 30" quando há PV atual registrado; só o máximo quando não há.
  const textoPv =
    pvAtual == null ? String(pv) : `${pvAtual}/${pv}`;

  const etiquetas = [
    dados.raca,
    dados.alinhamento,
    ...dados.classes.map((c) => c.classe).filter((c) => !vazio(c)),
  ].filter((x) => !vazio(x));

  return (
    <article className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
      {/* Nome e nível */}
      <header className="flex items-stretch gap-2 bg-background p-3">
        <h2 className="flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 text-xl font-bold tracking-tight">
          {nome}
        </h2>
        <div className="flex w-14 flex-col items-center justify-center rounded-lg bg-surface-2 px-2">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted">
            nível
          </span>
          <span className="text-xl font-bold tabular-nums">{nivel}</span>
        </div>
      </header>

      {/* Arte, com os chips de combate por cima */}
      <div className="relative aspect-[4/5] bg-surface-2">
        {vazio(dados.retrato) ? (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-xs text-muted">
            Sem retrato. Envie um na edição da ficha.
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dados.retrato}
            alt={`Retrato de ${nome}`}
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          <Chip
            icone="👊"
            rotulo="corpo a corpo"
            valor={formatarMod(ataqueCorpo(dados))}
            cor="ataque"
          />
          <Chip
            icone="⚡"
            rotulo="iniciativa"
            valor={formatarMod(iniciativa(dados))}
            cor="agil"
          />
          <Chip icone="🛡️" rotulo="CA" valor={String(ca(dados))} cor="defesa" />
        </div>
      </div>

      {/* Etiquetas e texto */}
      <div className="space-y-3 p-4">
        {etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {etiquetas.map((e) => (
              <span
                key={e}
                className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium"
              >
                {e}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-4 text-xs">
          {(
            [
              ["Fortitude", fortitude(dados)],
              ["Reflexos", reflexos(dados)],
              ["Vontade", vontade(dados)],
            ] as const
          ).map(([r, v]) => (
            <span key={r}>
              <span className="text-muted">{r}</span>{" "}
              <span className="font-semibold tabular-nums">
                {formatarMod(v)}
              </span>
            </span>
          ))}
        </div>

        <Bloco titulo="Talentos" itens={dados.talentos} />
        <Bloco titulo="Habilidades" itens={dados.habilidades} />

        {!vazio(dados.tamanho) && (
          <p className="text-[11px] text-muted">
            Tamanho {tamanhoPor(dados.tamanho).nome}
            {!vazio(dados.deslocamento) && ` · ${dados.deslocamento}`}
          </p>
        )}
      </div>

      {/* Faixa de baixo */}
      <footer className="flex gap-1.5 border-t border-border bg-background p-3">
        <Chip
          icone="⭐"
          rotulo="nível"
          valor={String(nivel)}
          cor="ataque"
        />
        <Chip
          icone="🏹"
          rotulo="à distância"
          valor={formatarMod(ataqueDistancia(dados))}
          cor="agil"
        />
        <Chip icone="❤️" rotulo="PV" valor={textoPv} cor="defesa" />
      </footer>
    </article>
  );
}
