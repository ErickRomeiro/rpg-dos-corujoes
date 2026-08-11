// Acesso ao catálogo de dados de jogo (lado servidor).
//
// Regra de visibilidade: conteúdo com `mesaId` nulo é oficial e aparece em
// qualquer mesa; conteúdo com `mesaId` preenchido é homebrew e só aparece na
// mesa dona. Quando os dois existem com o mesmo nome, o da mesa vence — é o
// que permite ao mestre sobrescrever uma arma do SRD com a versão da casa.

import { prisma } from "@/lib/prisma";
import type { TipoCatalogo } from "@/lib/generated/prisma/enums";
import type { Raca } from "@/lib/dnd35/racas";
import type { Classe } from "@/lib/dnd35/classes";
import type { ArmaModelo, ArmaduraModelo } from "@/lib/dnd35/equipamento";
import type { Talento } from "@/lib/dnd35/talentos";
import type { Divindade } from "@/lib/dnd35/divindades";
import { acharNoCatalogo, type EntradaCatalogo } from "@/lib/catalogo-entrada";

// Reexportados para quem já os importava daqui; a definição é client-safe.
export { acharNoCatalogo, type EntradaCatalogo };

const SISTEMA = "dnd35";

/**
 * Lista as entradas de um tipo, já resolvendo a precedência do homebrew.
 * `mesaId` ausente devolve só o conteúdo oficial.
 */
export async function listarCatalogo<T>(
  tipo: TipoCatalogo,
  mesaId?: string | null,
): Promise<EntradaCatalogo<T>[]> {
  const itens = await prisma.itemCatalogo.findMany({
    where: {
      sistema: SISTEMA,
      tipo,
      OR: [{ mesaId: null }, ...(mesaId ? [{ mesaId }] : [])],
    },
    select: { id: true, nome: true, fonte: true, mesaId: true, dados: true },
    orderBy: { nome: "asc" },
  });

  // Homebrew da mesa substitui o oficial de mesmo nome.
  const porNome = new Map<string, EntradaCatalogo<T>>();
  for (const item of itens) {
    const entrada: EntradaCatalogo<T> = {
      id: item.id,
      nome: item.nome,
      fonte: item.fonte,
      daMesa: item.mesaId != null,
      dados: item.dados as T,
    };
    const existente = porNome.get(item.nome);
    if (!existente || entrada.daMesa) porNome.set(item.nome, entrada);
  }

  return [...porNome.values()].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

/**
 * Deixa o termo do usuário ser só texto dentro de um LIKE.
 *
 * Sem isto, quem digita "%" casa com o catálogo inteiro e quem digita "_" casa
 * com qualquer letra naquela posição — o filtro passa a mentir em silêncio. A
 * barra invertida vem primeiro, senão escaparíamos as barras que acabamos de
 * introduzir.
 */
const escaparLike = (termo: string) => termo.replace(/[\\%_]/g, "\\$&");

/** O que a consulta bruta devolve, antes de virar `EntradaCatalogo`. */
type LinhaCatalogo = {
  id: string;
  nome: string;
  fonte: string;
  mesaId: string | null;
  dados: unknown;
};

/**
 * Busca por nome, para autocompletes de conjuntos grandes (magias).
 *
 * Procura no nome em português e também no `nomeOriginal` em inglês guardado
 * dentro de `dados`. O catálogo é todo em português — é o que aparece na tela
 * e o que a ficha grava —, mas quem joga chega ao nome em inglês o tempo todo:
 * está na planilha da mesa, nos livros que não foram traduzidos e em qualquer
 * busca na internet. Sem isso, digitar "fireball" não acha Bola de Fogo.
 *
 * Procura também nos `apelidos`, que são os nomes que o item já teve aqui —
 * ver `acharNoCatalogo`.
 *
 * Nem todo tipo do catálogo tem `nomeOriginal` — armas e armaduras, por
 * exemplo, não têm — e a maioria dos itens não tem apelido nenhum. Para esses
 * os filtros simplesmente não casam, o que não atrapalha: são todos OR.
 *
 * ACENTO: é SQL escrito à mão porque o `mode: "insensitive"` do Prisma resolve
 * maiúscula, não acento — "agua" não achava "Água" e "nevoa" não achava
 * "Névoa". Em português isso reprova a busca inteira, ainda mais no celular,
 * onde metade da mesa lê e quase ninguém acentua. `unaccent()` compara os dois
 * lados sem acento; o `ILIKE` continua cuidando da caixa.
 *
 * Custo: `unaccent()` é STABLE, então não entra em índice e a varredura é
 * sequencial. Com ~1.100 linhas no catálogo isso é irrelevante — se um dia
 * crescer a ponto de doer, o caminho é uma coluna normalizada e indexada, não
 * voltar a errar o acento.
 *
 * A extensão `unaccent` é criada por `npm run db:push` (ver
 * `scripts/preparar-busca.mjs`); sem ela esta consulta falha na hora.
 */
export async function buscarCatalogo<T>(
  tipo: TipoCatalogo,
  termo: string,
  mesaId?: string | null,
  limite = 20,
): Promise<EntradaCatalogo<T>[]> {
  const alvo = escaparLike(termo);
  const trecho = `%${alvo}%`;

  // As duas condições precisam ficar em parênteses irmãos: uma decide de quem
  // é o conteúdo, a outra onde o termo casa. Fundi-las num OR só faria a
  // segunda anular a primeira e vazar homebrew de outras mesas.
  //
  // `"mesaId" = NULL` nunca é verdade, então o mesmo texto serve para quem
  // passou mesa e para quem não passou: sem mesa, sobra só o oficial.
  const itens = await prisma.$queryRaw<LinhaCatalogo[]>`
    SELECT id, nome, fonte, "mesaId", dados
    FROM "ItemCatalogo"
    WHERE sistema = ${SISTEMA}
      AND tipo = ${tipo}::"TipoCatalogo"
      AND ("mesaId" IS NULL OR "mesaId" = ${mesaId ?? null}::text)
      AND (
        unaccent(nome) ILIKE unaccent(${trecho})
        OR unaccent(dados->>'nomeOriginal') ILIKE unaccent(${trecho})
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(
            -- O CASE evita explodir se algum 'apelidos' não for array: sem
            -- ele, jsonb_array_elements_text derruba a consulta inteira.
            CASE WHEN jsonb_typeof(dados->'apelidos') = 'array'
                 THEN dados->'apelidos'
                 ELSE '[]'::jsonb END
          ) AS apelido(valor)
          -- Sem curinga em volta: apelido serve para reencontrar um nome
          -- inteiro que existiu, não para alargar a busca.
          WHERE unaccent(apelido.valor) ILIKE unaccent(${alvo})
        )
      )
    ORDER BY nome
    LIMIT ${limite}::int
  `;

  return itens.map((i) => ({
    id: i.id,
    nome: i.nome,
    fonte: i.fonte,
    daMesa: i.mesaId != null,
    dados: i.dados as T,
  }));
}

/** Tudo que a ficha precisa para autocompletar, numa consulta só por tipo. */
export type CatalogoFicha = {
  racas: EntradaCatalogo<Raca>[];
  classes: EntradaCatalogo<Classe>[];
  armas: EntradaCatalogo<ArmaModelo>[];
  armaduras: EntradaCatalogo<ArmaduraModelo>[];
  talentos: EntradaCatalogo<Talento>[];
  divindades: EntradaCatalogo<Divindade>[];
  itens: EntradaCatalogo<{ nome: string; peso: number }>[];
};

export async function catalogoDaFicha(
  mesaId?: string | null,
): Promise<CatalogoFicha> {
  const [racas, classes, armas, armaduras, talentos, divindades, itens] =
    await Promise.all([
      listarCatalogo<Raca>("RACA", mesaId),
      listarCatalogo<Classe>("CLASSE", mesaId),
      listarCatalogo<ArmaModelo>("ARMA", mesaId),
      listarCatalogo<ArmaduraModelo>("ARMADURA", mesaId),
      listarCatalogo<Talento>("TALENTO", mesaId),
      listarCatalogo<Divindade>("DIVINDADE", mesaId),
      listarCatalogo<{ nome: string; peso: number }>("ITEM", mesaId),
    ]);

  return { racas, classes, armas, armaduras, talentos, divindades, itens };
}
