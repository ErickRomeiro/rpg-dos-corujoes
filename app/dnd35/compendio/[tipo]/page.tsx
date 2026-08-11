// Uma seção do Compêndio: a lista de um tipo, com busca.
//
// A busca é um formulário GET comum, então funciona sem JavaScript, o
// resultado tem endereço próprio — dá para mandar o link da magia no grupo — e
// o filtro roda no banco. Filtrar no cliente exigiria mandar as 761 magias
// para o navegador antes de a primeira letra ser digitada.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listarCatalogo, buscarCatalogo } from "@/lib/catalogo";
import { secaoPorSlug } from "@/lib/compendio";
import {
  EntradaArma,
  EntradaArmadura,
  EntradaClasse,
  EntradaDivindade,
  EntradaDominio,
  EntradaItem,
  EntradaMagia,
  EntradaRaca,
  EntradaTalento,
} from "@/app/dnd35/compendio/_components/entradas";
import type { EntradaCatalogo } from "@/lib/catalogo-entrada";
import type { Magia } from "@/lib/dnd35/magias";
import type { Talento } from "@/lib/dnd35/talentos";
import type { Raca } from "@/lib/dnd35/racas";
import type { Classe } from "@/lib/dnd35/classes";
import type { ArmaModelo, ArmaduraModelo } from "@/lib/dnd35/equipamento";
import type { Divindade } from "@/lib/dnd35/divindades";
import type { Dominio } from "@/lib/dnd35/dominios";

/**
 * O `dados` de cada linha vem do banco como JSON, então o tipo real só é
 * conhecido depois de olhar o `tipo` da seção. Cada ramo do switch abaixo
 * afirma um tipo concreto — e não `never`, que passaria no compilador
 * justamente por desligar a checagem dentro do componente.
 */
const como = <T,>(e: EntradaCatalogo<unknown>) => e as EntradaCatalogo<T>;

/**
 * Teto de linhas por página. Existe por causa das magias: despejar 761 verbetes
 * de uma vez faz uma página enorme para responder a pergunta errada — quem
 * abre a lista quer procurar, não rolar. Quem realmente quer o todo continua
 * chegando lá, buscando.
 */
const LIMITE = 120;

// Não há `generateStaticParams` aqui de propósito: esta página lê `searchParams`
// (o `?q=` da busca), o que a torna dinâmica de qualquer jeito. Enumerar os
// slugs não geraria página estática nenhuma — só gastaria tempo por requisição.
// Slug inválido continua caindo no `notFound()` lá embaixo.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tipo: string }>;
}): Promise<Metadata> {
  const { tipo } = await params;
  const secao = secaoPorSlug(tipo);
  return { title: `${secao?.rotulo ?? "Compêndio"} · D&D 3.5` };
}

export default async function SecaoCompendioPage({
  params,
  searchParams,
}: {
  params: Promise<{ tipo: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { tipo } = await params;
  const secao = secaoPorSlug(tipo);
  if (!secao) notFound();

  const { q } = await searchParams;
  const termo = (Array.isArray(q) ? q[0] : (q ?? "")).trim();

  // Sem mesaId: só conteúdo oficial. Ver o comentário de lib/compendio.ts.
  const entradas = termo
    ? await buscarCatalogo<unknown>(secao.tipo, termo, null, LIMITE)
    : await listarCatalogo<unknown>(secao.tipo, null);

  const cortada = !termo && entradas.length > LIMITE;
  const mostradas = cortada ? entradas.slice(0, LIMITE) : entradas;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/dnd35/compendio"
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para o Compêndio
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight">
          <span aria-hidden className="mr-2">
            {secao.icone}
          </span>
          {secao.rotulo}
        </h1>
        <p className="mt-2 text-muted">{secao.descricao}</p>
      </header>

      <form method="get" className="mt-6 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={termo}
          placeholder={`Buscar ${secao.singular}…`}
          aria-label={`Buscar ${secao.singular}`}
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Buscar
        </button>
        {termo && (
          <Link
            href={`/dnd35/compendio/${secao.slug}`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            Limpar
          </Link>
        )}
      </form>

      {secao.tipo === "MAGIA" && (
        <p className="mt-2 text-xs text-muted">
          A busca também acha pelo nome em inglês — “fireball” encontra Bola de
          Fogo.
        </p>
      )}

      <p className="mt-6 text-sm text-muted">
        {mostradas.length === 0
          ? termo
            ? `Nada encontrado para “${termo}”.`
            : "Esta seção ainda não tem conteúdo."
          : cortada
            ? `Mostrando ${mostradas.length} de ${entradas.length}. Use a busca para chegar ao resto.`
            : `${mostradas.length} ${mostradas.length === 1 ? secao.singular : (secao.plural ?? secao.rotulo.toLowerCase())}`}
      </p>

      <ul className="mt-2">
        {mostradas.map((e) => {
          switch (secao.tipo) {
            case "MAGIA":
              return <EntradaMagia key={e.id} e={como<Magia>(e)} />;
            case "TALENTO":
              return <EntradaTalento key={e.id} e={como<Talento>(e)} />;
            case "ARMA":
              return <EntradaArma key={e.id} e={como<ArmaModelo>(e)} />;
            case "ARMADURA":
              return <EntradaArmadura key={e.id} e={como<ArmaduraModelo>(e)} />;
            case "CLASSE":
              return <EntradaClasse key={e.id} e={como<Classe>(e)} />;
            case "RACA":
              return <EntradaRaca key={e.id} e={como<Raca>(e)} />;
            case "DOMINIO":
              return <EntradaDominio key={e.id} e={como<Dominio>(e)} />;
            case "DIVINDADE":
              return <EntradaDivindade key={e.id} e={como<Divindade>(e)} />;
            default:
              return (
                <EntradaItem
                  key={e.id}
                  e={como<{ nome: string; peso: number }>(e)}
                />
              );
          }
        })}
      </ul>
    </div>
  );
}
