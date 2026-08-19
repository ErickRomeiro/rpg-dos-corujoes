// Como cada tipo do catálogo se apresenta na leitura.
//
// Todos usam o mesmo formato — nome, uma linha de fatos curtos, e o texto
// longo embaixo — em vez de uma tabela por tipo. O gesto que esta tela serve é
// achar UMA coisa no meio da sessão, não comparar cem lado a lado; e um
// formato só atravessa bem a tela do celular, que é onde metade da mesa lê.
//
// Os nomes legíveis (classe, magia, tamanho, perícia, atributo) saem das
// mesmas tabelas que a ficha usa, e não de cópias locais. O que o banco guarda
// é sempre o id — "nevoaObscurecente" —, então quem exibe tem de resolver.

import {
  ABREV_ATRIBUTO,
  PERICIAS,
  tamanhoPor,
  type ChaveAtributo,
} from "@/lib/ficha";
import { classePor } from "@/lib/dnd35/classes";
import { magiaPor } from "@/lib/dnd35/magias";
import type { EntradaCatalogo } from "@/lib/catalogo-entrada";
import type { Magia } from "@/lib/dnd35/magias";
import type { Talento } from "@/lib/dnd35/talentos";
import type { Raca } from "@/lib/dnd35/racas";
import type { Classe } from "@/lib/dnd35/classes";
import type { ArmaModelo, ArmaduraModelo } from "@/lib/dnd35/equipamento";
import type { Divindade } from "@/lib/dnd35/divindades";
import type { Dominio } from "@/lib/dnd35/dominios";

const vazio = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "");

/** "Dano 1d8 · Crítico 19-20/×2" — pares que somem quando não há valor. */
function Fatos({ pares }: { pares: [string, React.ReactNode][] }) {
  const uteis = pares.filter(([, v]) => !vazio(v));
  if (uteis.length === 0) return null;
  return (
    <p className="mt-1 text-xs text-muted">
      {uteis.map(([rotulo, valor], i) => (
        <span key={rotulo}>
          {i > 0 && " · "}
          <span className="text-muted/70">{rotulo}</span>{" "}
          <span className="text-foreground/90">{valor}</span>
        </span>
      ))}
    </p>
  );
}

/** Um parágrafo rotulado, para o texto longo (benefício, poder concedido). */
function Prosa({ rotulo, texto }: { rotulo: string; texto?: string }) {
  if (vazio(texto)) return null;
  return (
    <p className="mt-2 text-sm">
      <span className="text-muted">{rotulo}:</span> {texto}
    </p>
  );
}

/** O invólucro comum: nome, selo da fonte e o que cada tipo acrescentar. */
function Entrada({
  nome,
  fonte,
  daMesa,
  livro,
  children,
}: {
  nome: string;
  fonte: string;
  daMesa: boolean;
  /** Livro de origem dentro do próprio dado, quando existe. */
  livro?: string;
  children?: React.ReactNode;
}) {
  // `livro` é mais específico do que `fonte`: a fonte diz de qual transcrição a
  // linha veio, o livro diz de que obra a regra é. Quando os dois existem, o
  // livro ganha, e "Livro do Jogador" fica implícito quando não há nenhum.
  const selo = livro ?? (fonte === "SRD 3.5" ? null : fonte);

  return (
    <li className="border-b border-border/60 py-3 last:border-0">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="font-medium">{nome}</h3>
        {daMesa && (
          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
            desta mesa
          </span>
        )}
        {selo && <span className="text-[11px] text-muted">{selo}</span>}
      </div>
      {children}
    </li>
  );
}

const nomePericia = (id: string) =>
  PERICIAS.find((p) => p.id === id)?.nome ?? id;

const BBA: Record<string, string> = {
  boa: "boa (+1/nível)",
  media: "média (+3/4)",
  ruim: "ruim (+1/2)",
};

export function EntradaMagia({ e }: { e: EntradaCatalogo<Magia> }) {
  const d = e.dados;
  // "Bardo 3 · Clérigo 2" — a mesma magia tem nível diferente por classe, e é
  // isso que se procura quando se abre a lista no meio de uma sessão.
  const niveis = Object.entries(d.niveis ?? {})
    .map(([chave, n]) => `${classePor(chave)?.nome ?? chave} ${n}`)
    .join(" · ");

  return (
    <Entrada nome={e.nome} fonte={e.fonte} daMesa={e.daMesa} livro={d.livro}>
      <Fatos
        pares={[
          ["Escola", d.escola],
          ["Níveis", niveis],
          ["Inglês", d.nomeOriginal],
        ]}
      />
      {!vazio(d.resumo) && <p className="mt-1 text-sm">{d.resumo}</p>}
      {!vazio(d.referencia) && (
        <a
          href={d.referencia}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs font-medium text-accent hover:underline"
        >
          Texto completo no d20srd ↗
        </a>
      )}
    </Entrada>
  );
}

export function EntradaTalento({ e }: { e: EntradaCatalogo<Talento> }) {
  const d = e.dados;
  return (
    <Entrada nome={e.nome} fonte={e.fonte} daMesa={e.daMesa} livro={d.livro}>
      <Fatos pares={[["Categoria", d.categoria]]} />
      <Prosa rotulo="Pré-requisito" texto={d.preRequisito} />
      <Prosa rotulo="Benefício" texto={d.beneficio} />
    </Entrada>
  );
}

export function EntradaArma({ e }: { e: EntradaCatalogo<ArmaModelo> }) {
  const d = e.dados;
  const notas = [
    d.naoLetal && "dano não-letal",
    d.haste && "arma de haste (3 m)",
    d.dupla && "arma dupla",
  ].filter(Boolean) as string[];

  return (
    <Entrada nome={e.nome} fonte={e.fonte} daMesa={e.daMesa}>
      <Fatos
        pares={[
          ["Categoria", d.categoria],
          ["Manejo", d.manejo],
          ["Dano (M)", d.dano],
          ["Dano (P)", d.danoP],
          ["Crítico", d.critico],
          ["Alcance", d.alcance],
          ["Tipo", d.tipo],
          ["Custo", d.custo],
          ["Peso", d.peso == null ? "" : `${d.peso} kg`],
        ]}
      />
      {notas.length > 0 && (
        <p className="mt-1 text-xs text-muted">{notas.join(" · ")}</p>
      )}
    </Entrada>
  );
}

export function EntradaArmadura({ e }: { e: EntradaCatalogo<ArmaduraModelo> }) {
  const d = e.dados;
  const desloc = [d.deslocamento9, d.deslocamento6]
    .filter((x) => !vazio(x))
    .join(" / ");

  return (
    <Entrada nome={e.nome} fonte={e.fonte} daMesa={e.daMesa}>
      <Fatos
        pares={[
          ["Categoria", d.categoria],
          ["CA", d.bonusCa == null ? "" : `+${d.bonusCa}`],
          ["Des. máx", d.desMax == null ? "" : `+${d.desMax}`],
          ["Penalidade", d.penalidade == null ? "" : String(d.penalidade)],
          ["Falha", d.falhaMagia == null ? "" : `${d.falhaMagia}%`],
          ["Deslocamento", desloc],
          ["Custo", d.custo],
          ["Peso", d.peso == null ? "" : `${d.peso} kg`],
        ]}
      />
    </Entrada>
  );
}

export function EntradaClasse({ e }: { e: EntradaCatalogo<Classe> }) {
  const d = e.dados;
  const boas = (d.resistenciasBoas ?? [])
    .map((r) => r[0].toUpperCase() + r.slice(1))
    .join(", ");
  const pericias = (d.periciasClasse ?? []).map(nomePericia).join(", ");

  return (
    <Entrada nome={e.nome} fonte={e.fonte} daMesa={e.daMesa} livro={d.livro}>
      <Fatos
        pares={[
          ["Dado de vida", d.dadoVida ? `d${d.dadoVida}` : ""],
          ["BBA", BBA[d.bba] ?? d.bba],
          ["Resistências boas", boas],
          ["Perícias/nível", d.pontosPericia ? `${d.pontosPericia} + INT` : ""],
          [
            "Conjuração",
            d.conjuracao ? ABREV_ATRIBUTO[d.conjuracao as ChaveAtributo] : "",
          ],
        ]}
      />
      <Prosa rotulo="Perícias de classe" texto={pericias} />
    </Entrada>
  );
}

export function EntradaRaca({ e }: { e: EntradaCatalogo<Raca> }) {
  const d = e.dados;
  const ajustes = Object.entries(d.ajustes ?? {})
    .map(
      ([chave, v]) =>
        `${v > 0 ? "+" : ""}${v} ${ABREV_ATRIBUTO[chave as ChaveAtributo]}`,
    )
    .join(", ");
  const bonus = Object.entries(d.periciasBonus ?? {})
    .map(([id, v]) => `${v > 0 ? "+" : ""}${v} ${nomePericia(id)}`)
    .join(", ");

  return (
    <Entrada nome={e.nome} fonte={e.fonte} daMesa={e.daMesa}>
      <Fatos
        pares={[
          ["Atributos", ajustes || "nenhum ajuste"],
          ["Tamanho", d.tamanho ? tamanhoPor(d.tamanho).nome : ""],
          ["Deslocamento", d.deslocamento],
          ["Perícias", bonus],
        ]}
      />
      <Prosa rotulo="Idiomas" texto={d.idiomas} />
      {(d.tracos ?? []).length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {d.tracos.map((t) => (
            <li key={t.nome}>
              <span className="font-medium">{t.nome}</span>
              {!vazio(t.notas) && <span className="text-muted"> — {t.notas}</span>}
            </li>
          ))}
        </ul>
      )}
    </Entrada>
  );
}

export function EntradaDominio({ e }: { e: EntradaCatalogo<Dominio> }) {
  const d = e.dados;
  const deuses = (d.deuses ?? []).join(", ");
  const opcionais = (d.deusesOpcionais ?? []).join(", ");

  return (
    <Entrada nome={e.nome} fonte={e.fonte} daMesa={e.daMesa} livro={d.livro}>
      <Prosa rotulo="Poder concedido" texto={d.poderConcedido} />
      {(d.magias ?? []).length > 0 && (
        <ol className="mt-2 grid gap-x-4 gap-y-0.5 text-sm sm:grid-cols-3">
          {d.magias.map((m, i) => (
            <li key={i}>
              <span className="text-muted">{i + 1}º</span>{" "}
              {magiaPor(m)?.nome ?? m}
            </li>
          ))}
        </ol>
      )}
      <Fatos
        pares={[
          ["Deuses", deuses],
          ["Com permissão do mestre", opcionais],
        ]}
      />
    </Entrada>
  );
}

export function EntradaDivindade({ e }: { e: EntradaCatalogo<Divindade> }) {
  const d = e.dados;
  return (
    <Entrada nome={e.nome} fonte={e.fonte} daMesa={e.daMesa}>
      <Fatos
        pares={[
          ["Título", d.titulo],
          ["Tendência", d.tendencia],
          ["Domínios", (d.dominios ?? []).join(", ")],
          ["Arma predileta", d.armaPredileta],
        ]}
      />
      <Prosa rotulo="Adoradores" texto={d.adoradores} />
    </Entrada>
  );
}

export function EntradaItem({
  e,
}: {
  e: EntradaCatalogo<{ nome: string; peso: number }>;
}) {
  return (
    <Entrada nome={e.nome} fonte={e.fonte} daMesa={e.daMesa}>
      <Fatos
        pares={[["Peso", e.dados?.peso == null ? "" : `${e.dados.peso} kg`]]}
      />
    </Entrada>
  );
}
