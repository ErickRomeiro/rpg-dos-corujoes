// Seções de um sistema de RPG. Por enquanto, as seções do D&D 3.5,
// usadas no cabeçalho (quando dentro de /dnd35) e no hub do sistema.
export type SecaoNav = {
  href: string;
  rotulo: string;
  descricao: string;
  icone: string;
};

export const secoesDnd35: SecaoNav[] = [
  {
    href: "/dnd35/fichas",
    rotulo: "Fichas",
    descricao: "Crie e gerencie suas fichas de personagem com cálculos automáticos.",
    icone: "📜",
  },
  {
    href: "/dnd35/compendio",
    rotulo: "Compêndio",
    descricao: "Consulte raças, classes, magias e a biblioteca completa de livros.",
    icone: "📚",
  },
  {
    href: "/dnd35/mestre",
    rotulo: "Mestre",
    descricao: "Ferramentas de narração: iniciativa, encontros, NPCs e campanhas.",
    icone: "🐉",
  },
  {
    href: "/dnd35/utilitarios",
    rotulo: "Utilitários",
    descricao: "Rolador de dados e geradores rápidos para a mesa.",
    icone: "🎲",
  },
];
