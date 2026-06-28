// Catálogo de livros de D&D 3.5 (links externos para os PDFs).
// Fonte: https://clamor-das-batalhas.webnode.page/dungeons-dragons-3-5/
//
// Esta é a camada "linkar os PDFs" da estratégia mista de dados de jogo:
// enquanto os dados estruturados (raças, classes, magias) são montados aos
// poucos, o Compêndio já oferece acesso direto a todo o material de origem.

export type Livro = {
  /** Título exibido. */
  titulo: string;
  /** Link direto para o PDF (Dropbox). */
  url: string;
  /** Marca os livros essenciais do sistema, destacados na interface. */
  essencial?: boolean;
};

export type CategoriaLivros = {
  id: string;
  nome: string;
  descricao: string;
  livros: Livro[];
};

export const categoriasLivros: CategoriaLivros[] = [
  {
    id: "nucleo",
    nome: "Núcleo",
    descricao: "Os livros básicos do sistema — o ponto de partida de qualquer mesa.",
    livros: [
      {
        titulo: "Ficha do Jogador 3.5",
        url: "https://www.dropbox.com/s/x25rt7689nposwe/D%26D%203.5%20-%20Ficha%20de%20player.pdf?dl=0",
        essencial: true,
      },
      {
        titulo: "Livro do Jogador 3.5",
        url: "https://www.dropbox.com/s/nttfw5c1tk34tcy/D%26D%203.5%20-%20Livro%20do%20Jogador.pdf?dl=0",
        essencial: true,
      },
      {
        titulo: "Livro do Mestre 3.5",
        url: "https://www.dropbox.com/s/saoy97e2900tjmw/D%26D%203.5%20-%20Livro%20do%20Mestre.pdf?dl=0",
        essencial: true,
      },
      {
        titulo: "Livro dos Monstros 3.5",
        url: "https://www.dropbox.com/s/zsrp58oovc7io10/D%26D%203.5%20-%20Livro%20dos%20Monstros.pdf?dl=0",
        essencial: true,
      },
      {
        titulo: "Livro do Jogador II",
        url: "https://www.dropbox.com/s/jyq0vt0ju905l34/D%26D%203.5%20-%20Player%27s%20Handbook%20II.pdf?dl=0",
      },
      {
        titulo: "Livro do Mestre II",
        url: "https://www.dropbox.com/s/le8dkhlrskqanhf/D%26D%203.5%20-%20Dungeon%20Master%27s%20Guide%20II.pdf?dl=0",
      },
    ],
  },
  {
    id: "regras",
    nome: "Regras e Referência",
    descricao: "Compêndios de regras, talentos e ferramentas de criação.",
    livros: [
      {
        titulo: "Rules Compendium",
        url: "https://www.dropbox.com/s/udto1lbl9zupj9l/D%26D%203.5%20-%20Rules%20Compendium.pdf?dl=0",
      },
      {
        titulo: "Códice de Talentos (todos os talentos)",
        url: "https://www.dropbox.com/s/906x2qz5ovx5100/docslide.com.br_dd-35-todos-os-talentos.pdf?dl=0",
      },
      {
        titulo: "Unearthed Arcana",
        url: "https://www.dropbox.com/s/6syruw1wvs2ubfi/D%26D%203.5%20Unearthed%20Arcana.pdf?dl=0",
      },
      {
        titulo: "Hero Builder's Guidebook",
        url: "https://www.dropbox.com/s/hf4etmtvcp6z9zg/D%26D%203.5%20-%20Hero%20Builder%27s%20Guidebook.pdf?dl=0",
      },
    ],
  },
  {
    id: "classes",
    nome: "Classes e Prestígio",
    descricao: "Livros completos de classe, classes de prestígio e novas opções de personagem.",
    livros: [
      {
        titulo: "O Livro Completo do Arcano",
        url: "https://www.dropbox.com/s/jlvoyyzwcc9s1yt/D%26D%203.5%20-%20O%20Livro%20Completo%20do%20Arcano.pdf?dl=0",
      },
      {
        titulo: "Livro Completo do Aventureiro",
        url: "https://www.dropbox.com/s/vs6833rrcqnjxfy/D%26D%203.5%20-%20Livro%20Completo%20do%20Aventureiro.pdf?dl=0",
      },
      {
        titulo: "O Livro Completo do Divino",
        url: "https://www.dropbox.com/s/9625d1taotp0qu1/D%26D%203.5%20-%20O%20Livro%20Completo%20do%20Divino.pdf?dl=0",
      },
      {
        titulo: "O Livro Completo do Guerreiro",
        url: "https://www.dropbox.com/s/imkrifupi2t6evu/D%26D%203.5%20-%20O%20Livro%20Completo%20do%20Guerreiro.pdf?dl=0",
      },
      {
        titulo: "Complete Champion",
        url: "https://www.dropbox.com/s/n7tf244uf7uwge0/D%26D%203.5%20-%20Complete%20Champion.pdf?dl=0",
      },
      {
        titulo: "Complete Psionic",
        url: "https://www.dropbox.com/s/xz7k663ejiwinuw/D%26D%203.5%20-%20Complete%20Psionic.pdf?dl=0",
      },
      {
        titulo: "Complete Mage",
        url: "https://www.dropbox.com/s/7nia6at2yi1maer/D%26D%203.5%20Complete_Mage.pdf?dl=0",
      },
      {
        titulo: "Complete Scoundrel",
        url: "https://www.dropbox.com/s/0z10cqxpls0f4ga/D%26D%203.5%20-%20Complete%20Scoundrel%20%28Ocr%29.pdf?dl=0",
      },
      {
        titulo: "Canção e Silêncio",
        url: "https://www.dropbox.com/s/noh5h1u76ujpknp/D%26D%203.5%20-%20Livro%20Can%C3%A7%C3%A3o%20e%20Sil%C3%AAncio.pdf?dl=0",
      },
      {
        titulo: "Classes de Prestígio",
        url: "https://www.dropbox.com/s/86pe5aqz79vev9p/D%26D%203.5%20-%20Classes%20de%20Prest%C3%ADgio%203.5.pdf?dl=0",
      },
      {
        titulo: "Mestres Selvagens",
        url: "https://www.dropbox.com/s/4edh0ujmut09chy/D%26D%203.5%20-%20Livro%20%20Mestres%20Selvagens.pdf?dl=0",
      },
      {
        titulo: "Punhos e Espadas",
        url: "https://www.dropbox.com/s/cd2lkbcwg6bkk12/D%26D%203.5%20-%20Livro%20Punhos%20e%20Espadas.pdf?dl=0",
      },
      {
        titulo: "Defensores da Fé",
        url: "https://www.dropbox.com/s/7mg6wmltmf9i590/D%26D%203.5%20-%20Livro%20%20Defensores%20da%20F%C3%A9.pdf?dl=0",
      },
    ],
  },
  {
    id: "racas",
    nome: "Raças",
    descricao: "Suplementos dedicados às raças jogáveis e suas culturas.",
    livros: [
      {
        titulo: "Races of Stone",
        url: "https://www.dropbox.com/s/2u3wun8z9fgulai/D%26D%203.5%20-%20Races%20of%20Stone.pdf?dl=0",
      },
      {
        titulo: "Races of the Wild",
        url: "https://www.dropbox.com/s/ttzhny9adi3ivr9/D%26D%20%203.5%20-%20Races%20of%20the%20Wild.pdf?dl=0",
      },
      {
        titulo: "Races of Destiny",
        url: "https://www.dropbox.com/s/sxy6gb4q4ihzb4o/D%26D%203.5%20Races%20Of%20Destiny.pdf?dl=0",
      },
      {
        titulo: "Races of the Dragon",
        url: "https://www.dropbox.com/s/63p4hb69phzj16c/D%26D%203.5%20-%20Races%20of%20the%20Dragon.pdf?dl=0",
      },
      {
        titulo: "Races of Eberron",
        url: "https://www.dropbox.com/s/khx24m6f3v9wr42/D%26D%203.5%20-%20Races%20of%20Eberron.pdf?dl=0",
      },
      {
        titulo: "Savage Species",
        url: "https://www.dropbox.com/s/9k2sk7lkwmunwcq/D%26D%203.5%20-%20Savage%20Species.pdf?dl=0",
      },
      {
        titulo: "Linhagens e Tomos",
        url: "https://www.dropbox.com/s/mj5mpkieiwl2kut/D%26D%203.5%20-%20Livro%20Linhagens%20e%20Tomos.pdf?dl=0",
      },
    ],
  },
  {
    id: "magia",
    nome: "Magia e Itens",
    descricao: "Magias, itens mágicos, equipamento e armas lendárias.",
    livros: [
      {
        titulo: "Spell Compendium",
        url: "https://www.dropbox.com/s/epatwz1jwvpg3az/D%26D%203.5%20-%20Livro%20Spell%20Compendium.pdf?dl=0",
      },
      {
        titulo: "Magic Item Compendium",
        url: "https://www.dropbox.com/s/khr4vwr8ax3u7kp/D%26D%203.5%20-%20Magic%20Item%20Compendium.pdf?dl=0",
      },
      {
        titulo: "Arms and Equipment Guide",
        url: "https://www.dropbox.com/s/z2ou3g2cl6aiihr/D%26D%203.5%20-%20Arms%20and%20Equipment%20Guide.pdf?dl=0",
      },
      {
        titulo: "Weapons of Legacy",
        url: "https://www.dropbox.com/s/52lz69mmcenoh4y/D%26D%203.5%20-%20Weapons%20of%20Legacy.pdf?dl=0",
      },
      {
        titulo: "Magic of Incarnum",
        url: "https://www.dropbox.com/s/o3665y7k2mshbpb/D%26D%203.5%20-%20Magic%20of%20Incarnum.pdf?dl=0",
      },
    ],
  },
  {
    id: "monstros",
    nome: "Monstros",
    descricao: "Bestiários e manuais de criaturas para o Mestre.",
    livros: [
      {
        titulo: "Compêndio de Monstros",
        url: "https://www.dropbox.com/s/932alrjbqxyv8ni/D%26D%203.5%20-%20Comp%C3%AAndio%20de%20Monstros.pdf?dl=0",
      },
      {
        titulo: "Monster Manual III",
        url: "https://www.dropbox.com/s/r5ek5ov786v0vni/D%26D%203.5%20-%20Monster%20Manual%20III.pdf?dl=0",
      },
      {
        titulo: "Monster Manual V",
        url: "https://www.dropbox.com/s/puef3n9wfgmb001/D%26D%203.5%20-%20Monster_Manual_V.pdf?dl=0",
      },
      {
        titulo: "Lords of Madness — The Book of Aberrations",
        url: "https://www.dropbox.com/s/409ybv5ah1q21d7/D%26D%203.5%20-%20Lords%20of%20Madness%20-%20The%20Book%20of%20Aberrations.pdf?dl=0",
      },
      {
        titulo: "Draconomicon",
        url: "https://www.dropbox.com/s/41djderc03eztxj/D%26D%203.5%20-%20Draconomicon.pdf?dl=0",
      },
      {
        titulo: "Enemies and Allies",
        url: "https://www.dropbox.com/s/i73uh3y3gpaxg93/D%26D%203.5%20-%20Enemies%20And%20Allies.pdf?dl=0",
      },
    ],
  },
  {
    id: "ambientacao",
    nome: "Ambientação e Aventuras",
    descricao: "Cenários temáticos, ferramentas de aventura e desafios prontos.",
    livros: [
      {
        titulo: "Sandstorm — Mastering the Perils of Fire and Sand",
        url: "https://www.dropbox.com/s/0my1niq9ovkrvw6/D%26D%203.5%20-%20Sandstorm%20-%20Mastering%20the%20Perils%20of%20Fire%20and%20Sand%20.pdf?dl=0",
      },
      {
        titulo: "Frostburn",
        url: "https://www.dropbox.com/s/v5bogf4vmcxz6o1/D%26D%203.5%20-%20Frostburn.pdf?dl=0",
      },
      {
        titulo: "Stormwrack",
        url: "https://www.dropbox.com/s/b3t7bq3rdlkodsz/D%26D%203.5%20-%20Stormwrack.pdf?dl=0",
      },
      {
        titulo: "Cityscape",
        url: "https://www.dropbox.com/s/32xo3rw3pb0v47s/D%26D%203.5%20-%20Livro%20Cityscape.pdf?dl=0",
      },
      {
        titulo: "Dungeonscape",
        url: "https://www.dropbox.com/s/2hsojpf38ntbrt9/D%26D%203.5%20Dungeonscape.pdf?dl=0",
      },
      {
        titulo: "Dragon Magic",
        url: "https://www.dropbox.com/s/1zla6c497lsd4ys/D%26D%203.5%20-%20Dragon%20Magic.pdf?dl=0",
      },
      {
        titulo: "Heroes of Battle",
        url: "https://www.dropbox.com/s/6vshr1d1d7qo8o4/D%26D%203.5%20-%20Heroes%20of%20Battle.pdf?dl=0",
      },
      {
        titulo: "Heroes of Horror",
        url: "https://www.dropbox.com/s/l5harnm7o23jdjn/D%26D%203.5%20-%20Heroes%20Of%20Horror.pdf?dl=0",
      },
      {
        titulo: "Book of Challenges",
        url: "https://www.dropbox.com/s/5bob78whjbooavm/D%26D%203.5%20-%20Book%20of%20Challenges.pdf?dl=0",
      },
      {
        titulo: "Stronghold Builder's Guidebook",
        url: "https://www.dropbox.com/s/ec9o6irklfpdqy5/D%26D%203.5%20-%20Stronghold%20Builder%27s%20Guidebook.pdf?dl=0",
      },
    ],
  },
  {
    id: "forgotten-realms",
    nome: "Forgotten Realms",
    descricao: "Material do cenário de campanha Forgotten Realms (Faerûn).",
    livros: [
      {
        titulo: "Crenças e Panteões",
        url: "https://www.dropbox.com/s/ghbb1yrshxqyyop/D%26D%203.0%20-%20Forgotten%20Realms%20-%20Cren%C3%A7as%20e%20Pante%C3%B5es.pdf?dl=0",
      },
      {
        titulo: "Underdark",
        url: "https://www.dropbox.com/s/m4z9kunmt75kdio/D%26D%203.5%20-%20Forgotten%20Realms%20-%20Underdark.pdf?dl=0",
      },
      {
        titulo: "Races of Faerûn",
        url: "https://www.dropbox.com/s/9ste84jl7h119o7/D%26D%203.5%20-%20Races%20of%20Faerun.pdf?dl=0",
      },
      {
        titulo: "Magic of Faerûn",
        url: "https://www.dropbox.com/s/21c17h6vlhxvcsr/D%26D%203.5%20-%20Magic%20of%20Faer%C3%BBn.pdf?dl=0",
      },
      {
        titulo: "City of Splendors: Waterdeep",
        url: "https://www.dropbox.com/s/yqzegpm9sy447j4/D%26D%203.5%20-%20City%20of%20Splendor%20Waterdeep.pdf?dl=0",
      },
      {
        titulo: "Dragons of Faerûn",
        url: "https://www.dropbox.com/s/ad5a00zvn1nc2td/D%26D%203.5%20-%20Dragons%20of%20Faerun.pdf?dl=0",
      },
      {
        titulo: "Serpent Kingdoms",
        url: "https://www.dropbox.com/s/kxcb3fa3vzh2r67/D%26D%203.5%20-%20Serpent%20Kingdoms.pdf?dl=0",
      },
      {
        titulo: "Champions of Valor",
        url: "https://www.dropbox.com/s/weflmweeymseco1/Champions%20Of%20Valor.pdf?dl=0",
      },
      {
        titulo: "Champions of Ruin",
        url: "https://www.dropbox.com/s/4g4xew1abb7iaac/Champions%20of%20Ruin.pdf?dl=0",
      },
    ],
  },
  {
    id: "divindades",
    nome: "Divindades e Alinhamento",
    descricao: "Deuses, planos morais e os tomos do bem e do mal.",
    livros: [
      {
        titulo: "Divindades e Semideuses",
        url: "https://www.dropbox.com/s/wi6254izlfig4q8/D%26D%203.5%20-%20Divindades%20e%20Semideuses.pdf?dl=0",
      },
      {
        titulo: "Deities and Demigods",
        url: "https://www.dropbox.com/s/ghtpy27m0w378hr/D%26D%203.5%20-%20Seities%20and%20Semigods.pdf?dl=0",
      },
      {
        titulo: "Book of Exalted Deeds",
        url: "https://www.dropbox.com/s/y3yyeq0pzneq284/D%26D%203.5%20-%20Book%20of%20Exalted%20Deeds.pdf?dl=0",
      },
      {
        titulo: "Book of Vile Darkness",
        url: "https://www.dropbox.com/s/8j4bsi7yhfg4wml/D%26D%203.5%20-%20Book%20of%20Vile%20Darkness.pdf?dl=0",
      },
      {
        titulo: "Exemplars of Evil",
        url: "https://www.dropbox.com/s/qcynbkja5h5r1z2/D%26D%203.5%20-%20Exemplars%20of%20Evil.pdf?dl=0",
      },
      {
        titulo: "Elder Evils",
        url: "https://www.dropbox.com/s/f0vseiokh9je0hu/D%26D%203.5%20-%20Elder%20Evils.pdf?dl=0",
      },
    ],
  },
  {
    id: "epico-planos",
    nome: "Épico e Planos",
    descricao: "Regras para personagens épicos e viagens pelos planos.",
    livros: [
      {
        titulo: "Livro dos Níveis Épicos",
        url: "https://www.dropbox.com/s/gybw83mefhshf7i/D%26D%20-%20Livro%20dos%20Niveis%20Epicos.pdf?dl=0",
      },
      {
        titulo: "Manual dos Planos",
        url: "https://www.dropbox.com/s/fxbk1eey60pff04/D%26D%20-%20Manual%20dos%20Planos.pdf?dl=0",
      },
    ],
  },
];

/** Total de livros no catálogo, calculado a partir das categorias. */
export const totalLivros = categoriasLivros.reduce(
  (soma, categoria) => soma + categoria.livros.length,
  0,
);
