import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioAtual, podeGerenciarMesa } from "@/lib/permissoes";
import { excluirItemCatalogo } from "@/app/dnd35/catalogo/actions";
import { CriarItemForm } from "@/app/dnd35/mesas/[id]/catalogo/_components/criar-item-form";

export const metadata: Metadata = { title: "Conteúdo da mesa · D&D 3.5" };

const SISTEMA = "dnd35";

const ROTULO_TIPO: Record<string, string> = {
  RACA: "Raças",
  CLASSE: "Classes",
  ARMA: "Armas",
  ARMADURA: "Armaduras",
  TALENTO: "Talentos",
  MAGIA: "Magias",
  ITEM: "Itens",
  DIVINDADE: "Divindades",
  IDIOMA: "Idiomas",
};

export default async function CatalogoDaMesaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await usuarioAtual();
  if (!user) return null;

  // Só o mestre da mesa (ou dono do site) administra o conteúdo dela.
  if (!(await podeGerenciarMesa(user, id))) notFound();

  const mesa = await prisma.mesa.findUnique({
    where: { id },
    select: { id: true, nome: true },
  });
  if (!mesa) notFound();

  const itens = await prisma.itemCatalogo.findMany({
    where: { sistema: SISTEMA, mesaId: id },
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
    select: {
      id: true,
      tipo: true,
      nome: true,
      dados: true,
      criadoPor: { select: { name: true, email: true } },
    },
  });

  const oficiais = await prisma.itemCatalogo.groupBy({
    by: ["tipo"],
    where: { sistema: SISTEMA, mesaId: null },
    _count: true,
  });
  const totalOficial = oficiais.reduce((s, o) => s + o._count, 0);

  const porTipo = new Map<string, typeof itens>();
  for (const item of itens) {
    const lista = porTipo.get(item.tipo) ?? [];
    lista.push(item);
    porTipo.set(item.tipo, lista);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href={`/dnd35/mesas/${mesa.id}`}
        className="text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        ← Voltar para a mesa
      </Link>

      <header className="mb-8 mt-6">
        <h1 className="text-3xl font-bold tracking-tight">
          📖 Conteúdo de {mesa.nome}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Classes, raças, armas e itens criados para esta mesa. Eles aparecem
          nas fichas dos jogadores daqui, junto com os {totalOficial} itens
          oficiais do SRD — e quando o nome coincide, o da mesa prevalece.
        </p>
      </header>

      <CriarItemForm mesaId={mesa.id} />

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          Conteúdo próprio
          <span className="ml-2 text-sm font-normal text-muted">
            ({itens.length})
          </span>
        </h2>

        {itens.length === 0 ? (
          <p className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm text-muted">
            Esta mesa ainda não tem conteúdo próprio. Use o formulário acima
            para cadastrar aquilo que existe só na sua campanha.
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {[...porTipo.entries()].map(([tipo, lista]) => (
              <div key={tipo}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {ROTULO_TIPO[tipo] ?? tipo}
                </h3>
                <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-surface">
                  {lista.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-4 p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{item.nome}</p>
                        <p className="mt-0.5 truncate text-xs text-muted">
                          {resumo(item.dados)}
                        </p>
                        {item.criadoPor && (
                          <p className="mt-1 text-[11px] text-muted">
                            por {item.criadoPor.name ?? item.criadoPor.email}
                          </p>
                        )}
                      </div>
                      <form action={excluirItemCatalogo} className="shrink-0">
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                        >
                          Excluir
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Mostra os campos preenchidos do JSON, sem precisar conhecer cada tipo. */
function resumo(dados: unknown): string {
  if (!dados || typeof dados !== "object") return "—";
  const pares = Object.entries(dados as Record<string, unknown>)
    .filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
  return pares.length > 0 ? pares.join(" · ") : "sem detalhes";
}
