// A forma de uma entrada do catálogo e como casar um nome com ela.
//
// Mora fora de lib/catalogo.ts porque aquele arquivo importa o Prisma e só roda
// no servidor, enquanto a ficha é componente de cliente e precisa resolver
// nomes na tela. Aqui não há acesso a banco nenhum — é só formato e comparação.

export type EntradaCatalogo<T> = {
  id: string;
  nome: string;
  fonte: string;
  /** true quando veio do homebrew da mesa. */
  daMesa: boolean;
  dados: T;
};

/**
 * Acha a entrada que corresponde a um nome gravado na ficha.
 *
 * Procura o nome de hoje e, se não achar, os `apelidos` guardados dentro de
 * `dados` — o nome que a linha já teve aqui, ou como outro livro da mesa a
 * chama (o Livro Completo do Guerreiro diz "cajado" onde o Livro do Jogador
 * diz "bordão").
 *
 * Isto existe porque a ficha guarda o nome como texto, e as tabelas de
 * lib/dnd35 renomeiam itens toda vez que uma transcrição corrige o que estava
 * traduzido por fora — foram 44 talentos numa passagem e 22 armas e armaduras
 * na seguinte. Sem consultar o apelido, cada renomeação dessas faria a ficha
 * antiga parar de casar com o catálogo sem avisar ninguém.
 */
export function acharNoCatalogo<T>(
  lista: EntradaCatalogo<T>[],
  nome: string,
): EntradaCatalogo<T> | undefined {
  if (!nome) return undefined;
  return (
    lista.find((e) => e.nome === nome) ??
    lista.find((e) =>
      (e.dados as { apelidos?: string[] } | null)?.apelidos?.includes(nome),
    )
  );
}
