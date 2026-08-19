// Domínios de clérigo do D&D 3.5: os 22 do Livro do Jogador (cap. 11,
// p. 186–189) e os 5 do Livro Completo do Guerreiro (cap. 3, p. 114–115).
//
// Um domínio não é uma classe, e por isso não entrou como chave em
// `niveis` lá em magias.ts: ele é um pacote — divindades que o oferecem, um
// poder concedido e uma magia para cada nível de 1 a 9. Guardar só o nível da
// magia jogaria fora as outras duas partes, que é o que o clérigo escolhe de
// fato ao montar o personagem.
//
// A posição em `magias` é o nível: `magias[0]` é a magia de 1º nível e
// `magias[8]` a de 9º. Não existe domínio com buraco no meio, então o array é
// sempre de nove ids — não faz sentido repetir o nível dentro de cada item.
//
// Sete magias aqui referenciadas não são concedidas por classe nenhuma e
// existem só através do domínio: destruicaoSagrada, marteloDoCaos,
// nuvemProfana e coleraDaOrdem, do Livro do Jogador, mais furiaValente,
// rugidoDoLeao e mantoDaBravuraMaior, que são exclusivas do domínio da
// Coragem. Em magias.ts elas aparecem com `niveis` vazio.
//
// Das quatro magias novas do Livro Completo do Guerreiro, só mantoDaBravura
// escapa disso: o livro manda incluí-la também nas listas de clérigo e
// paladino, e lá ela é Clr 3 / Pal 2.

import { MAGIAS, type Magia } from "./magias.ts";

export type Dominio = {
  id: string;
  nome: string;
  /** Divindades do panteão padrão que oferecem o domínio. */
  deuses: string[];
  /**
   * Divindades que só oferecem o domínio se o Mestre deixar. Os domínios do
   * Livro Completo do Guerreiro são de deuses do panteão daquele livro e
   * chegam ao panteão do Livro do Jogador por essa porta.
   */
  deusesOpcionais?: string[];
  /** O que o domínio concede além das magias, no texto do livro. */
  poderConcedido: string;
  /** Nove ids de MAGIAS: a posição é o nível, de 1 a 9. */
  magias: string[];
  /** Livro de origem, quando não é o núcleo. Ausente = Livro do Jogador. */
  livro?: string;
};

export const DOMINIOS: Dominio[] = [
  {
    id: "agua",
    nome: "Água",
    deuses: ["Obad-Hai"],
    poderConcedido:
      "Expulsa ou destrói criaturas do fogo como um clérigo bondoso usaria Expulsar. Fascina ou comanda criaturas da água como um clérigo maligno usaria Fascinar. Essa habilidade pode ser usada uma quantidade de vezes equivalente a 3 + seu modificador de Carisma por dia. Este poder concedido é uma habilidade sobrenatural.",
    magias: ["nevoaObscurecente", "nevoa", "respirarNaAgua", "controlarAgua", "tempestadeGlacial", "coneGlacial", "nevoaAcida", "evaporacao", "grupoDeElementais"],
  },
  {
    id: "animais",
    nome: "Animais",
    deuses: ["Ehlonna", "Obad-Hai"],
    poderConcedido:
      "Você pode lançar falar com animais uma vez por dia como uma habilidade similar a magia. Conhecimento (natureza) passa a ser uma perícia de classe.",
    magias: ["acalmarAnimais", "imobilizarAnimal", "dominarAnimais", "invocarAliadoDaNatureza4", "comunhaoComANatureza", "cupulaDeProtecaoContraAVida", "formaAnimal", "invocarAliadoDaNatureza8", "alterarForma"],
  },
  {
    id: "ar",
    nome: "Ar",
    deuses: ["Obad-Hai"],
    poderConcedido:
      "Expulsa ou destrói criaturas da terra como um clérigo bondoso usaria Expulsar. Fascina ou comanda criaturas do ar como um clérigo maligno usaria Fascinar. Essa habilidade pode ser usada uma quantidade de vezes equivalente a 3 + seu modificador de Carisma por dia. Este poder concedido é uma habilidade sobrenatural.",
    magias: ["nevoaObscurecente", "muralhaDeVento", "formaGasosa", "andarNoAr", "controlarOsVentos", "correnteDeRelampagos", "controlarOClima", "ciclone", "grupoDeElementais"],
  },
  {
    id: "bem",
    nome: "Bem",
    deuses: ["Corellon Larethian", "Ehlonna", "Garl Glittergold", "Heironeous", "Kord", "Moradin", "Pelor", "Yondalla"],
    poderConcedido: "Você conjura magias do bem com +1 no nível de conjurador.",
    magias: ["protecaoContraOMal", "ajuda", "circuloMagicoContraOMal", "destruicaoSagrada", "dissiparOMal", "barreiraDeLaminas", "palavraSagrada", "auraSagrada", "invocarCriaturas9"],
  },
  {
    id: "caos",
    nome: "Caos",
    deuses: ["Corellon Larethian", "Erythnul", "Gruumsh", "Kord", "Olidammara"],
    poderConcedido: "Você conjura magias do caos com +1 no nível de conjurador.",
    magias: ["protecaoContraAOrdem", "despedacar", "circuloMagicoContraAOrdem", "marteloDoCaos", "dissiparAOrdem", "animarObjetos", "palavraDoCaos", "mantoDoCaos", "invocarCriaturas9"],
  },
  {
    id: "conhecimento",
    nome: "Conhecimento",
    deuses: ["Boccob", "Vecna"],
    poderConcedido:
      "Todas as perícias de Conhecimento passam a ser perícias de classe. Você conjura magias de adivinhação com +1 no nível de conjurador.",
    magias: ["detectarPortasSecretas", "detectarPensamentos", "clarividenciaClariaudiencia", "adivinhacaoMagia", "visaoDaVerdade", "encontrarOCaminho", "lendasEHistorias", "discernirLocalizacao", "sextoSentido"],
  },
  {
    id: "cura",
    nome: "Cura",
    deuses: ["Pelor"],
    poderConcedido: "Você conjura magias de cura com +1 no nível de conjurador.",
    magias: ["curarFerimentosLeves", "curarFerimentosModerados", "curarFerimentosGraves", "curarFerimentosCriticos", "curarFerimentosLevesEmMassa", "curaCompleta", "regeneracao", "curarFerimentosCriticosEmMassa", "curaCompletaEmMassa"],
  },
  {
    id: "destruicao",
    nome: "Destruição",
    deuses: ["St. Cuthbert", "Hextor"],
    poderConcedido:
      "Uma vez por dia, você ganha o poder de destruir, uma habilidade sobrenatural; pode-se realizar um único ataque corpo a corpo com +4 de bônus na jogada de ataque e um modificador de dano equivalente ao seu nível de clérigo (caso acerte). Você precisa declarar o uso do poder antes de fazer a jogada de ataque.",
    magias: ["infligirFerimentosLeves", "despedacar", "praga", "infligirFerimentosCriticos", "infligirFerimentosLevesEmMassa", "doencaPlena", "desintegrar", "terremoto", "implosao"],
  },
  {
    id: "enganacao",
    nome: "Enganação",
    deuses: ["Boccob", "Erythnul", "Garl Glittergold", "Olidammara", "Nerull"],
    poderConcedido: "Blefar, Disfarces e Esconder-se passam a ser perícias de classe.",
    magias: ["transformacaoMomentanea", "invisibilidade", "dificultarDeteccao", "confusao", "visaoFalsa", "despistar", "animacaoIlusoria", "metamorfosearObjetos", "pararOTempo"],
  },
  {
    id: "fogo",
    nome: "Fogo",
    deuses: ["Obad-Hai"],
    poderConcedido:
      "Expulsa ou destrói criaturas da água como um clérigo bondoso usaria Expulsar. Fascina ou comanda criaturas do fogo como um clérigo maligno usaria Fascinar. Essa habilidade pode ser usada uma quantidade de vezes equivalente a 3 + seu modificador de Carisma por dia. Este poder concedido é uma habilidade sobrenatural.",
    magias: ["maosFlamejantes", "criarChamas", "resistenciaAElementos", "muralhaDeFogo", "escudoDoFogo", "sementeDeFogo", "tempestadeDeFogo", "nuvemIncendiaria", "grupoDeElementais"],
  },
  {
    id: "forca",
    nome: "Força",
    deuses: ["St. Cuthbert", "Gruumsh", "Kord", "Pelor"],
    poderConcedido:
      "Você pode realizar um feito de força, uma habilidade sobrenatural que concede um bônus de melhoria para sua Força igual ao seu nível de clérigo. Ativar esse poder é uma ação livre. Ele pode ser usado uma vez por dia e dura 1 rodada.",
    magias: ["aumentarPessoa", "forcaDoTouro", "roupaEncantada", "imunidadeAMagia", "forcaDosJustos", "peleRochosa", "maoPoderosaDeBigby", "punhoCerradoDeBigby", "maoEsmagadoraDeBigby"],
  },
  {
    id: "guerra",
    nome: "Guerra",
    deuses: ["Corellon Larethian", "Erythnul", "Gruumsh", "Heironeous", "Hextor"],
    poderConcedido:
      "Adquire o talento Usar Arma Comum (se necessário) e Foco em Arma da arma predileta de seu deus.",
    magias: ["armaMagica", "armaEspiritual", "roupaEncantada", "poderDivino", "colunaDeChamas", "barreiraDeLaminas", "palavraDePoderCegar", "palavraDePoderAtordoar", "palavraDePoderMatar"],
  },
  {
    id: "magia",
    nome: "Magia",
    deuses: ["Boccob", "Vecna", "Wee Jas"],
    poderConcedido:
      "Você usa pergaminhos, varinhas e outros itens mágicos de complemento a magia ou ativação de magia como um mago com metade de seu nível de clérigo (no mínimo 1º nível). Se você também for um mago, seu nível de mago e esses níveis são somados para esses fins.",
    magias: ["auraMagicaDeNystul", "identificacao", "dissiparMagia", "transferenciaDePoderDivino", "resistenciaAMagia", "campoAntimagia", "reverterMagia", "protecaoContraMagias", "disjuncaoDeMordenkainen"],
  },
  {
    id: "mal",
    nome: "Mal",
    deuses: ["Erythnul", "Gruumsh", "Hextor", "Nerull", "Vecna"],
    poderConcedido: "Você conjura magias do mal com +1 no nível de conjurador.",
    magias: ["protecaoContraOBem", "profanar", "circuloMagicoContraOBem", "nuvemProfana", "dissiparOBem", "criarMortosVivos", "blasfemia", "auraProfana", "invocarCriaturas9"],
  },
  {
    id: "morte",
    nome: "Morte",
    deuses: ["Nerull", "Wee Jas"],
    poderConcedido:
      "Você pode usar o toque da morte uma vez por dia; ele é uma habilidade sobrenatural que gera um efeito de morte. É preciso realizar um ataque de toque corporal contra uma criatura viva (usando as regras para magias de toque). Caso acerte, jogue 1d6 por nível de clérigo. Se o total igualar ou superar os pontos de vida do alvo, ele morre (sem testes de resistência).",
    magias: ["causarMedo", "drenarForcaVital", "criarMortosVivosMenor", "protecaoContraAMorte", "matar", "criarMortosVivos", "destruicao", "criarMortosVivosMaior", "gritoDaBanshee"],
  },
  {
    id: "ordem",
    nome: "Ordem",
    deuses: ["St. Cuthbert", "Heironeous", "Hextor", "Moradin", "Wee Jas", "Yondalla"],
    poderConcedido: "Você conjura magias da ordem com +1 no nível de conjurador.",
    magias: ["protecaoContraOCaos", "acalmarEmocoes", "circuloMagicoContraOCaos", "coleraDaOrdem", "dissiparOCaos", "imobilizarMonstro", "ditado", "escudoDaOrdem", "invocarCriaturas9"],
  },
  {
    id: "plantas",
    nome: "Plantas",
    deuses: ["Ehlonna", "Obad-Hai"],
    poderConcedido:
      "Fascina ou comanda criaturas da terra como um clérigo maligno usaria Fascinar. Essa habilidade pode ser usada uma quantidade de vezes equivalente a 3 + seu modificador de Carisma por dia. Este poder concedido é uma habilidade sobrenatural. Conhecimento (natureza) passa a ser uma perícia de classe.",
    magias: ["constricao", "peleDeArvore", "ampliarPlantas", "comandarPlantas", "muralhaDeEspinhos", "repelirMadeira", "animarPlantas", "controlarPlantas", "homensVegetais"],
  },
  {
    id: "protecao",
    nome: "Proteção",
    deuses: ["Corellon Larethian", "St. Cuthbert", "Fharlanghn", "Garl Glittergold", "Moradin", "Yondalla"],
    poderConcedido:
      "Você pode gerar um escudo de proteção, uma habilidade sobrenatural que concede ao alvo tocado um bônus de resistência no próximo teste de resistência igual ao seu nível de clérigo. Ativar este poder usa uma ação padrão. O escudo de proteção é um efeito de abjuração, com duração de 1 hora, que pode ser usado uma vez por dia.",
    magias: ["santuario", "protegerOutro", "protecaoContraElementos", "imunidadeAMagia", "resistenciaAMagia", "campoAntimagia", "repulsao", "limparAMente", "esferaPrismatica"],
  },
  {
    id: "sol",
    nome: "Sol",
    deuses: ["Ehlonna", "Pelor"],
    poderConcedido:
      "Uma vez por dia, você pode usar a Expulsão Aprimorada contra mortos-vivos no lugar de uma Expulsão comum. A Expulsão Aprimorada é idêntica à Expulsão normal, mas todos os mortos-vivos que seriam expulsos serão destruídos.",
    magias: ["suportarElementos", "esquentarMetal", "luzCegante", "escudoDoFogo", "colunaDeChamas", "sementeDeFogo", "raioDeSol", "explosaoSolar", "esferaPrismatica"],
  },
  {
    id: "sorte",
    nome: "Sorte",
    deuses: ["Fharlanghn", "Kord", "Olidammara"],
    poderConcedido:
      "Você adquire o poder da boa sorte, que pode ser usado uma vez por dia. Esta habilidade extraordinária lhe permite realizar novamente uma jogada. Você é obrigado a ficar com o novo resultado, mesmo que este seja pior que o resultado original.",
    magias: ["escudoEntropico", "ajuda", "protecaoContraElementos", "movimentacaoLivre", "cancelarEncantamento", "despistar", "reverterMagia", "instanteDePresciencia", "milagre"],
  },
  {
    id: "terra",
    nome: "Terra",
    deuses: ["Moradin", "Obad-Hai"],
    poderConcedido:
      "Expulsa ou destrói criaturas do ar como um clérigo bondoso usaria Expulsar. Fascina ou comanda criaturas da terra como um clérigo maligno usaria Fascinar. Essa habilidade pode ser usada uma quantidade de vezes equivalente a 3 + seu modificador de Carisma por dia. Este poder concedido é uma habilidade sobrenatural.",
    magias: ["pedraEncantada", "amolecerTerraEPedra", "moldarRochas", "pedrasAfiadas", "muralhaDePedra", "peleRochosa", "terremoto", "corpoDeFerro", "grupoDeElementais"],
  },
  {
    id: "viagem",
    nome: "Viagem",
    deuses: ["Fharlanghn"],
    poderConcedido:
      "Durante 1 rodada/nível de clérigo por dia, você pode agir sem ser incomodado por efeitos mágicos que impedem o movimento (similar ao efeito da magia movimentação livre). Esse efeito é automático e permanece até seu tempo máximo diário se esgotar ou não ser mais necessário. Ele pode ser ativado várias vezes em um dia (até a quantidade máxima de rodadas disponível). Essa é uma habilidade sobrenatural. A Sobrevivência passa a ser uma perícia de classe.",
    magias: ["passosLongos", "localizarObjetos", "voo", "portaDimensional", "teletransporte", "encontrarOCaminho", "teletransporteMaior", "passagemInvisivel", "projecaoAstral"],
  },

  // --- Livro Completo do Guerreiro ---
  {
    id: "coragem",
    nome: "Coragem",
    deuses: ["Valkar"],
    deusesOpcionais: ["Heironeous", "Yondalla"],
    poderConcedido:
      "O personagem emana uma aura de coragem que fornece +4 de bônus nos testes de resistência contra efeitos de medo para todos os aliados (incluindo o personagem) num raio de 3 m. Essa habilidade sobrenatural somente está ativa quando o usuário estiver consciente.",
    magias: ["removerMedo", "ajuda", "mantoDaBravura", "heroismo", "furiaValente", "banqueteDeHerois", "heroismoMaior", "rugidoDoLeao", "mantoDaBravuraMaior"],
    livro: "Livro Completo do Guerreiro",
  },
  {
    id: "destino",
    nome: "Destino",
    deuses: ["Lyris"],
    deusesOpcionais: ["Nerull", "Obad-Hai"],
    poderConcedido:
      "O personagem adquire a habilidade esquiva sobrenatural, que lhe permite conservar seu bônus de Destreza na CA (se houver), mesmo em situações de surpresa ou contra ataques de um oponente invisível. No entanto, ele ainda perde seu bônus de Destreza na CA quando estiver imobilizado. Caso tenha a habilidade esquiva sobrenatural de uma classe diferente, ele adiciona seus níveis de clérigo à classe original para determinar se adquire a esquiva sobrenatural aprimorada.",
    magias: ["ataqueCerteiro", "augurio", "rogarMaldicao", "condicao", "marcaDaJustica", "tarefaMissao", "visao", "limparAMente", "sextoSentido"],
    livro: "Livro Completo do Guerreiro",
  },
  {
    id: "nobreza",
    nome: "Nobreza",
    deuses: ["Altua"],
    deusesOpcionais: ["Heironeous", "Pelor"],
    poderConcedido:
      "Uma vez por dia, o personagem tem a habilidade similar a magia de inspirar seus aliados, concedendo-lhes +2 de bônus de moral em testes de resistência, jogadas de ataque, testes de habilidade e perícia e dano com armas. Eles devem ser capazes de ouvir o personagem durante uma rodada. Ativar essa habilidade é uma ação padrão. Ela permanece ativa durante uma quantidade de rodadas equivalente ao bônus de Carisma do usuário.",
    magias: ["auxilioDivino", "cativar", "roupaEncantada", "discernirMentiras", "comandoMaior", "tarefaMissao", "repulsao", "ordem", "tempestadeDaVinganca"],
    livro: "Livro Completo do Guerreiro",
  },
  {
    id: "planejamento",
    nome: "Planejamento",
    deuses: ["Halmyr"],
    deusesOpcionais: ["Boccob", "Vecna", "Wee Jas"],
    poderConcedido: "Talento Estender Magia.",
    magias: ["visaoDaMorte", "augurio", "clarividenciaClariaudiencia", "condicao", "detectarVidencia", "banqueteDeHerois", "videnciaMaior", "discernirLocalizacao", "pararOTempo"],
    livro: "Livro Completo do Guerreiro",
  },
  {
    id: "tirania",
    nome: "Tirania",
    deuses: ["Typhos"],
    deusesOpcionais: ["Hextor", "Vecna", "Wee Jas"],
    poderConcedido:
      "Adicione +1 na CD dos testes de resistência contra qualquer magia de compulsão que o personagem conjurar.",
    magias: ["comando", "cativar", "discernirMentiras", "medo", "comandoMaior", "tarefaMissao", "maoPoderosaDeBigby", "enfeiticarMonstroEmMassa", "dominarMonstro"],
    livro: "Livro Completo do Guerreiro",
  },
];

export function dominioPor(chave: string): Dominio | undefined {
  if (!chave) return undefined;
  const alvo = chave.toLowerCase();
  return DOMINIOS.find(
    (d) => d.id.toLowerCase() === alvo || d.nome.toLowerCase() === alvo,
  );
}

/** As nove magias do domínio, já resolvidas, do 1º ao 9º nível. */
export function magiasDoDominio(chave: string): (Magia | undefined)[] {
  const dominio = dominioPor(chave);
  if (!dominio) return [];
  return dominio.magias.map((id) => MAGIAS.find((m) => m.id === id));
}
