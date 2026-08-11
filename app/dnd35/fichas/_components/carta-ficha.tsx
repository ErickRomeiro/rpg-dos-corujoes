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

type Chip = {
  icone: string;
  rotulo: string;
  valor: string;
  cor: "ataque" | "agil" | "defesa";
};

const FUNDO: Record<Chip["cor"], string> = {
  ataque: "bg-amber-500/90 text-black",
  agil: "bg-accent text-background",
  defesa: "bg-emerald-500/90 text-black",
};

/**
 * Chip compacto: só ícone e número, e o nome aparece ao apontar ou tocar.
 *
 * O rótulo escrito por extenso dentro do chip dobrava a largura dele e comia a
 * arte, que é o que a carta tem de mostrar. Então ele vira etiqueta sob
 * demanda.
 *
 * É `<button>` por um motivo prático, não semântico: hover não existe em tela
 * de toque, e elemento focável resolve os dois — no computador aparece ao
 * apontar, no celular ao tocar. Sem estado e sem JavaScript, o que mantém a
 * carta renderizando no servidor.
 *
 * A etiqueta é `aria-hidden` e o nome de verdade vai no texto acessível: quem
 * usa leitor de tela ouve "iniciativa +3" sem depender de apontar para nada.
 */
function Chip({ icone, rotulo, valor, cor }: Chip) {
  return (
    <button
      type="button"
      className={`group relative flex items-center gap-1.5 rounded-lg px-2 py-1 ${FUNDO[cor]}`}
    >
      <span aria-hidden className="text-base leading-none">
        {icone}
      </span>
      <span className="sr-only">{rotulo}:</span>
      <span className="text-base font-bold leading-none tabular-nums">
        {valor}
      </span>

      {/* Abre para a DIREITA porque a carta tem `overflow-hidden`: para cima ou
          para a esquerda, a etiqueta seria cortada pela borda. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-full top-1/2 z-20 ml-1.5 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
      >
        {rotulo}
      </span>
    </button>
  );
}

/**
 * A legenda dos ícones — SÓ na impressão.
 *
 * Na tela ela saiu: cada chip diz o que é ao ser apontado ou tocado, e repetir
 * tudo embaixo era ocupar a carta com informação que já está a um gesto. No
 * papel não há apontar nem tocar, então lá ela continua sendo a única forma de
 * saber o que cada ícone significa.
 *
 * Sai da MESMA lista que desenha os chips, e não de um texto escrito à parte:
 * legenda copiada à mão é legenda que um dia discorda do que está na carta.
 */
function Legenda({ chips }: { chips: Chip[] }) {
  return (
    <p className="hidden flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted print:flex">
      {chips.map((c) => (
        <span key={c.rotulo} className="whitespace-nowrap">
          <span aria-hidden>{c.icone}</span> {c.rotulo}
        </span>
      ))}
    </p>
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

  // Os chips sobre a arte: o que se pergunta em combate.
  const combate: Chip[] = [
    {
      icone: "👊",
      rotulo: "corpo a corpo",
      valor: formatarMod(ataqueCorpo(dados)),
      cor: "ataque",
    },
    {
      icone: "⚡",
      rotulo: "iniciativa",
      valor: formatarMod(iniciativa(dados)),
      cor: "agil",
    },
    { icone: "🛡️", rotulo: "CA", valor: String(ca(dados)), cor: "defesa" },
  ];

  // Os da faixa de baixo: o resumo do personagem.
  const resumo: Chip[] = [
    { icone: "⭐", rotulo: "nível", valor: String(nivel), cor: "ataque" },
    {
      icone: "🏹",
      rotulo: "à distância",
      valor: formatarMod(ataqueDistancia(dados)),
      cor: "agil",
    },
    { icone: "❤️", rotulo: "PV", valor: textoPv, cor: "defesa" },
  ];

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

      {/* A arte é o FUNDO desta faixa, e o texto vem por cima da parte de
          baixo dela — é o que dá à referência a cara de carta, em vez de
          "imagem seguida de dados". Por isso a proporção é generosa: precisa
          caber a figura e ainda sobrar área para o painel repousar. */}
      <div className="relative aspect-[3/4] bg-surface-2">
        {vazio(dados.retrato) ? (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-xs text-muted">
            Sem retrato. Envie um na edição da ficha.
          </div>
        ) : (
          <>
            {/* A carta mostra o personagem INTEIRO, então a arte é contida e
                não recortada — recorte é o que corta pernas e cabeça. O preço
                é sobrar moldura nas laterais, e quem preenche é a própria
                imagem borrada por trás: fica um fundo que combina com a arte
                em vez de uma barra vazia. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dados.retrato}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dados.retrato}
              alt={`Retrato de ${nome}`}
              className="relative h-full w-full object-contain"
            />
          </>
        )}

        {/* Chips de combate na lateral, como na referência */}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {combate.map((c) => (
            <Chip key={c.rotulo} {...c} />
          ))}
        </div>

        {/* O painel de texto, repousando sobre o rodapé da arte */}
        <div className="absolute inset-x-2 bottom-2 space-y-2 rounded-xl bg-background/85 p-3 backdrop-blur-sm">
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

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
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
      </div>

      {/* Faixa de baixo: os chips de resumo e a legenda de todos eles */}
      <footer className="space-y-2 border-t border-border bg-background p-3">
        <div className="flex gap-1.5">
          {resumo.map((c) => (
            <Chip key={c.rotulo} {...c} />
          ))}
        </div>
        <Legenda chips={[...combate, ...resumo]} />
      </footer>
    </article>
  );
}
