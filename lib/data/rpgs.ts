// Sistemas de RPG disponíveis no projeto. A home lista estes cards.
// Conforme novos sistemas forem adicionados, basta incluí-los aqui.
export type Rpg = {
  id: string;
  nome: string;
  descricao: string;
  href: string;
  icone: string;
  /** Sistemas ainda não implementados aparecem como "em breve". */
  disponivel: boolean;
};

export const rpgs: Rpg[] = [
  {
    id: "dnd35",
    nome: "Dungeons & Dragons 3.5",
    descricao:
      "O clássico sistema de fantasia medieval. Fichas, compêndio de regras e ferramentas de mesa.",
    href: "/dnd35",
    icone: "🐉",
    disponivel: true,
  },
];
