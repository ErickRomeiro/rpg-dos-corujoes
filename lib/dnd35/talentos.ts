// Talentos de D&D 3.5.
//
// O bloco do núcleo é a Tabela 5-1 do Livro do Jogador (p. 90-91), transcrita
// linha a linha: nome, pré-requisito e benefício saem de lá como estão
// impressos. Depois vêm os 10 talentos de estilo de armas do Livro Completo
// do Guerreiro (Tabela 3-4). É o suficiente para autocompletar o campo de
// talento na ficha e já trazer a observação preenchida; a regra completa fica
// nos livros do Compêndio.
//
// Esta tabela já foi escrita a partir do SRD em inglês, traduzida por fora, e
// divergia do livro em dezenas de nomes. `apelidos` guarda o nome antigo de
// cada talento renomeado, para que ficha e busca antigas continuem achando —
// 44 talentos têm apelido.
//
// Três nomes antigos NÃO viraram apelido, porque hoje pertencem a outro
// talento. Ficha antiga com um destes provavelmente queria dizer outra coisa:
//
//   "Mãos Leves"    era +2 em Abrir Fechaduras e Operar Mecanismo,
//                    que no livro é Dedos Lépidos. Mãos Leves de verdade é
//                    +2 em Prestidigitação e Usar Cordas.
//   "Vitalidade"    era +4 em testes prolongados de esforço físico, que no
//                    livro é Tolerância. Vitalidade de verdade é +3 PV.
//   "Ampliar Magia" era dobrar o alcance, que no livro é Aumentar Magia.
//                    Ampliar Magia de verdade dobra a área.
//
// Quatro entradas saíram por não existirem na Tabela 5-1 nem em outro livro
// que esteja na mesa: "Talento Adicional" (não é talento, é o bônus racial
// do humano), "Proeza Atlética", "Sortudo" e "Conjuração Rápida". Ficha que
// tenha alguma delas continua mostrando o texto; só não autocompleta mais.
//
// Criar Construto é do Livro dos Monstros, não da Tabela 5-1, mas é SRD e por
// isso fica sem `livro` — a fonte dele é aberta como a do resto do núcleo.
//
// Com o núcleo batendo com o livro, os pré-requisitos dos talentos de estilo
// passaram a apontar para talentos que existem aqui — antes citavam nomes que
// esta tabela não tinha. Um script de conferência checa isso.
//
// Uma divergência dentro do próprio Livro Completo do Guerreiro: a Tabela 3-4
// omite "Ataque Poderoso" nos pré-requisitos de Bigorna do Trovão, mas a
// descrição na p. 112 o exige. Ficou o da descrição, que é o texto e não o
// resumo.

export type Talento = {
  nome: string;
  categoria:
    | "Geral"
    | "Combate"
    | "Metamágico"
    | "Criação de itens"
    | "Proficiência"
    /** Estilo de armas: uma combinação fixa de duas armas. Só no Guerreiro. */
    | "Estilo";
  preRequisito: string;
  beneficio: string;
  /** Nomes que este talento já teve aqui. Só para busca não quebrar. */
  apelidos?: string[];
  /** Livro de origem, quando não é o núcleo. Ausente = Livro do Jogador. */
  livro?: string;
};

export const TALENTOS: Talento[] = [
  // --- Geral ---
  { nome: "Acrobático", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Saltar e Acrobacia." },
  { nome: "Afinidade com Animais", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Adestrar Animais e Cavalgar." },
  { nome: "Ágil", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Equilíbrio e Arte da Fuga." },
  { nome: "Aptidão Mágica", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Identificar Magia e Usar Instrumento Mágico." },
  { nome: "Atlético", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Escalar e Natação." },
  { nome: "Auto-Suficiente", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Cura e Sobrevivência.", apelidos: ["Autossuficiente"] },
  { nome: "Contramágica Aprimorada", categoria: "Geral", preRequisito: "", beneficio: "Contramágica com magias da mesma escola." },
  { nome: "Corrida", categoria: "Geral", preRequisito: "", beneficio: "Percorre 5 vezes o deslocamento padrão, +4 nos testes de Saltar no final de uma corrida.", apelidos: ["Correr"] },
  { nome: "Dedos Lépidos", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Operar Mecanismo e Abrir Fechaduras." },
  { nome: "Diligente", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Avaliação e Decifrar Escrita." },
  { nome: "Dominar Magia", categoria: "Geral", preRequisito: "1º nível de mago", beneficio: "Capaz de preparar as magias escolhidas sem um grimório.", apelidos: ["Prontidão Mágica"] },
  { nome: "Expulsão Adicional", categoria: "Geral", preRequisito: "Habilidade de expulsar ou fascinar criaturas", beneficio: "4 tentativas diárias adicionais de Expulsar/Fascinar.", apelidos: ["Influência Divina"] },
  { nome: "Expulsão Aprimorada", categoria: "Geral", preRequisito: "Habilidade de expulsar ou fascinar criaturas", beneficio: "+1 nível efetivo para testes de Expulsão." },
  { nome: "Foco em Magia", categoria: "Geral", preRequisito: "", beneficio: "+1 na CD dos testes de resistência contra uma escola de magia específica." },
  { nome: "Foco em Magia Maior", categoria: "Geral", preRequisito: "Foco em Magia na escola", beneficio: "+1 na CD dos testes de resistência contra uma escola de magia específica." },
  { nome: "Foco em Perícia", categoria: "Geral", preRequisito: "", beneficio: "+3 nos testes da perícia escolhida." },
  { nome: "Fortitude Maior", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de resistência de Fortitude." },
  { nome: "Fraudulento", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Disfarces e Falsificação.", apelidos: ["Enganador"] },
  { nome: "Ignorar Componentes Materiais", categoria: "Geral", preRequisito: "", beneficio: "Conjura magias ignorando os componentes materiais." },
  { nome: "Investigador", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Obter Informação e Procurar." },
  { nome: "Liderança", categoria: "Geral", preRequisito: "6º nível de personagem", beneficio: "Atrai parceiros e seguidores." },
  { nome: "Magia Natural", categoria: "Geral", preRequisito: "Sab 13, habilidade Forma Selvagem", beneficio: "Capaz de lançar magias na forma selvagem." },
  { nome: "Magia Penetrante", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de conjurador contra Resistência à Magia." },
  { nome: "Magia Penetrante Maior", categoria: "Geral", preRequisito: "Magia Penetrante", beneficio: "+4 nos testes de conjurador contra Resistência à Magia." },
  { nome: "Magias em Combate", categoria: "Geral", preRequisito: "", beneficio: "+4 nos testes de Concentração para conjurar na defensiva.", apelidos: ["Conjuração Defensiva"] },
  { nome: "Mãos Leves", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Prestidigitação e Usar Cordas.", apelidos: ["Prestidigitador"] },
  { nome: "Negociador", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Diplomacia e Sentir Motivação." },
  { nome: "Persuasivo", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Blefar e Intimidar." },
  { nome: "Potencializar Invocação", categoria: "Geral", preRequisito: "Foco em Magia (conjuração)", beneficio: "As criaturas invocadas recebem +4 For e +4 Con." },
  { nome: "Prontidão", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Ouvir e Observar.", apelidos: ["Alerta"] },
  { nome: "Rastrear", categoria: "Geral", preRequisito: "", beneficio: "Utiliza Sobrevivência para rastrear." },
  { nome: "Reflexos Rápidos", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de resistência de Reflexos." },
  { nome: "Sorrateiro", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de Esconder-se e Furtividade.", apelidos: ["Furtivo"] },
  { nome: "Tolerância", categoria: "Geral", preRequisito: "", beneficio: "+4 nos testes para resistir ao dano por contusão." },
  { nome: "Duro de Matar", categoria: "Geral", preRequisito: "Tolerância", beneficio: "Permanece consciente entre −1 e −9 PV.", apelidos: ["Inquebrantável"] },
  { nome: "Vitalidade", categoria: "Geral", preRequisito: "", beneficio: "+3 pontos de vida.", apelidos: ["Rijeza"] },
  { nome: "Vontade de Ferro", categoria: "Geral", preRequisito: "", beneficio: "+2 nos testes de resistência de Vontade." },

  // --- Combate ---
  { nome: "Acuidade com Arma", categoria: "Combate", preRequisito: "Usar a arma, bônus base de ataque +1", beneficio: "Aplica o modificador de Des (em vez de For) nos ataques corporais com armas leves." },
  { nome: "Ataque Desarmado Aprimorado", categoria: "Combate", preRequisito: "", beneficio: "Considerado armado quando estiver desarmado.", apelidos: ["Golpe Desarmado Aprimorado"] },
  { nome: "Agarrar Aprimorado", categoria: "Combate", preRequisito: "Des 13, Ataque Desarmado Aprimorado", beneficio: "+4 nos testes de Agarrar e não provoca ataques de oportunidade." },
  { nome: "Desviar Objetos", categoria: "Combate", preRequisito: "Des 13, Ataque Desarmado Aprimorado", beneficio: "Desvia um ataque à distância por rodada.", apelidos: ["Aparar Projéteis"] },
  { nome: "Apanhar Objetos", categoria: "Combate", preRequisito: "Des 15, Desviar Objetos, Ataque Desarmado Aprimorado", beneficio: "Apanha uma arma arremessada ou projétil.", apelidos: ["Rebater Projéteis"] },
  { nome: "Ataque Atordoante", categoria: "Combate", preRequisito: "Des 13, Sab 13, Ataque Desarmado Aprimorado, bônus base de ataque +8", beneficio: "Atordoa a vítima com um ataque desarmado." },
  { nome: "Ataque Poderoso", categoria: "Combate", preRequisito: "For 13", beneficio: "Substitui bônus de ataque por dano (máximo: bônus base de ataque)." },
  { nome: "Trespassar", categoria: "Combate", preRequisito: "Ataque Poderoso", beneficio: "Desfere um ataque corporal extra depois de imobilizar um oponente." },
  { nome: "Trespassar Maior", categoria: "Combate", preRequisito: "Trespassar, Ataque Poderoso, bônus base de ataque +4", beneficio: "Trespassar sem limite de ataques por rodada.", apelidos: ["Grande Trespassar"] },
  { nome: "Encontrão Aprimorado", categoria: "Combate", preRequisito: "Ataque Poderoso", beneficio: "+4 nas tentativas de encontrão e não provoca ataques de oportunidade.", apelidos: ["Investida Aprimorada"] },
  { nome: "Atropelar Aprimorado", categoria: "Combate", preRequisito: "Ataque Poderoso", beneficio: "+4 nas tentativas de atropelar e não provoca ataques de oportunidade." },
  { nome: "Separar Aprimorado", categoria: "Combate", preRequisito: "Ataque Poderoso", beneficio: "+4 nas tentativas de Separar e não provoca ataques de oportunidade." },
  { nome: "Combate Montado", categoria: "Combate", preRequisito: "1 graduação em Cavalgar", beneficio: "Evita os ataques contra a montaria com um teste de Cavalgar." },
  { nome: "Arquearia Montada", categoria: "Combate", preRequisito: "Combate Montado", beneficio: "Sofre metade das penalidades nos ataques à distância realizados sobre montarias.", apelidos: ["Disparo Montado"] },
  { nome: "Investida Montada", categoria: "Combate", preRequisito: "Combate Montado", beneficio: "Pode se deslocar antes e depois de uma investida montada.", apelidos: ["Ataque Montado"] },
  { nome: "Investida Implacável", categoria: "Combate", preRequisito: "Combate Montado, Investida Montada", beneficio: "Investidas montadas causam dano dobrado.", apelidos: ["Investida Arrasadora"] },
  { nome: "Pisotear", categoria: "Combate", preRequisito: "Combate Montado", beneficio: "A vítima não pode evitar um atropelamento montado." },
  { nome: "Combater com Duas Armas", categoria: "Combate", preRequisito: "Des 15", beneficio: "Reduz −2 nas penalidades para combater com duas armas.", apelidos: ["Combate com Duas Armas"] },
  { nome: "Bloqueio Ambidestro", categoria: "Combate", preRequisito: "Combater com Duas Armas", beneficio: "A arma da mão inábil concede +1 de bônus de escudo na CA.", apelidos: ["Defesa com Duas Armas"] },
  { nome: "Combater com Duas Armas Aprimorado", categoria: "Combate", preRequisito: "Des 17, Combater com Duas Armas, bônus base de ataque +6", beneficio: "Adquire um segundo ataque com a mão inábil.", apelidos: ["Combate com Duas Armas Aprimorado"] },
  { nome: "Combater com Duas Armas Maior", categoria: "Combate", preRequisito: "Des 19, Combater com Duas Armas Aprimorado, Combater com Duas Armas, bônus base de ataque +11", beneficio: "Adquire um terceiro ataque com a mão inábil.", apelidos: ["Combate com Duas Armas Superior"] },
  { nome: "Especialização em Combate", categoria: "Combate", preRequisito: "Int 13", beneficio: "Substitui bônus de ataque por CA (máximo 5 pontos)." },
  { nome: "Desarme Aprimorado", categoria: "Combate", preRequisito: "Especialização em Combate", beneficio: "+4 nas tentativas de desarme e não provoca ataques de oportunidade.", apelidos: ["Desarmar Aprimorado"] },
  { nome: "Fintar Aprimorado", categoria: "Combate", preRequisito: "Especialização em Combate", beneficio: "Fintar em combate é uma ação de movimento.", apelidos: ["Finta Aprimorada"] },
  { nome: "Imobilização Aprimorada", categoria: "Combate", preRequisito: "Especialização em Combate", beneficio: "+4 nas tentativas de imobilização e não provoca ataques de oportunidade.", apelidos: ["Derrubar Aprimorado"] },
  { nome: "Ataque Giratório", categoria: "Combate", preRequisito: "Des 13, Especialização em Combate, Esquiva, Mobilidade, Ataque em Movimento, bônus base de ataque +4", beneficio: "Realiza um ataque corporal contra cada oponente dentro do alcance." },
  { nome: "Esquiva", categoria: "Combate", preRequisito: "Des 13", beneficio: "+1 de bônus de esquiva na CA contra um adversário à sua escolha." },
  { nome: "Mobilidade", categoria: "Combate", preRequisito: "Esquiva", beneficio: "+4 de bônus de esquiva na CA contra ataques de oportunidade." },
  { nome: "Ataque em Movimento", categoria: "Combate", preRequisito: "Mobilidade, bônus base de ataque +4", beneficio: "Capaz de se deslocar antes e depois do ataque." },
  { nome: "Foco em Arma", categoria: "Combate", preRequisito: "Usar a arma, bônus base de ataque +1", beneficio: "+1 de bônus nas jogadas de ataque com a arma escolhida." },
  { nome: "Especialização em Arma", categoria: "Combate", preRequisito: "Usar a arma, Foco em Arma, 4º nível de guerreiro", beneficio: "+2 de bônus no dano com a arma escolhida." },
  { nome: "Foco em Arma Maior", categoria: "Combate", preRequisito: "Usar a arma, Foco em Arma na arma, 8º nível de guerreiro", beneficio: "+2 de bônus nas jogadas de ataque com a arma escolhida." },
  { nome: "Especialização em Arma Maior", categoria: "Combate", preRequisito: "Usar a arma, Foco em Arma, Foco em Arma Maior, Especialização em Arma, 12º nível de guerreiro", beneficio: "+4 de bônus no dano com a arma escolhida." },
  { nome: "Iniciativa Aprimorada", categoria: "Combate", preRequisito: "", beneficio: "+4 nos testes de Iniciativa." },
  { nome: "Lutar às Cegas", categoria: "Combate", preRequisito: "", beneficio: "Jogar novamente chance de falha por camuflagem.", apelidos: ["Combater às Cegas"] },
  { nome: "Rapidez de Recarga", categoria: "Combate", preRequisito: "Usar Arma Simples (besta)", beneficio: "Recarrega bestas mais rapidamente." },
  { nome: "Reflexos de Combate", categoria: "Combate", preRequisito: "", beneficio: "Ataques de oportunidade adicionais." },
  { nome: "Saque Rápido", categoria: "Combate", preRequisito: "Bônus base de ataque +1", beneficio: "Saca uma arma branca como ação livre." },
  { nome: "Sucesso Decisivo Aprimorado", categoria: "Combate", preRequisito: "Usar a arma, bônus base de ataque +8", beneficio: "Dobra a margem de ameaça da arma.", apelidos: ["Crítico Aprimorado"] },
  { nome: "Tiro Certeiro", categoria: "Combate", preRequisito: "", beneficio: "+1 nos ataques à distância e no dano contra alvos num raio de 9 metros." },
  { nome: "Tiro Preciso", categoria: "Combate", preRequisito: "Tiro Certeiro", beneficio: "Anula a penalidade por disparar contra um adversário em combate corporal com um aliado (−4)." },
  { nome: "Tiro Rápido", categoria: "Combate", preRequisito: "Des 13, Tiro Certeiro", beneficio: "Um ataque à distância adicional por rodada.", apelidos: ["Rapidez de Disparo"] },
  { nome: "Tiro Longo", categoria: "Combate", preRequisito: "Tiro Certeiro", beneficio: "Aumenta o incremento de distância em 50% ou 100%." },
  { nome: "Tiro em Movimento", categoria: "Combate", preRequisito: "Des 13, Esquiva, Mobilidade, Tiro Certeiro, bônus base de ataque +4", beneficio: "Pode se deslocar antes e depois de um ataque à distância.", apelidos: ["Tiro à Queima-Roupa"] },
  { nome: "Tiro Múltiplo", categoria: "Combate", preRequisito: "Des 17, Tiro Certeiro, Tiro Rápido, bônus base de ataque +6", beneficio: "Dispara duas ou mais flechas simultaneamente.", apelidos: ["Disparo Múltiplo"] },
  { nome: "Tiro Preciso Aprimorado", categoria: "Combate", preRequisito: "Des 19, Tiro Certeiro, Tiro Preciso, bônus base de ataque +11", beneficio: "Ignora qualquer cobertura ou camuflagem (exceto total) para ataques à distância." },
  { nome: "Ataque com Escudo Aprimorado", categoria: "Combate", preRequisito: "Usar Escudo", beneficio: "Conserva o bônus do escudo na CA quando ataca com ele." },

  // --- Metamágico ---
  { nome: "Acelerar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Conjura a magia como ação livre." },
  { nome: "Ampliar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Dobra a área da magia.", apelidos: ["Ampliar Área"] },
  { nome: "Aumentar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Dobra o alcance da magia." },
  { nome: "Elevar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Conjura a magia num nível mais elevado." },
  { nome: "Estender Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Dobra a duração da magia." },
  { nome: "Magia Sem Gestos", categoria: "Metamágico", preRequisito: "", beneficio: "Ignora os componentes gestuais da magia.", apelidos: ["Magia Imóvel"] },
  { nome: "Magia Silenciosa", categoria: "Metamágico", preRequisito: "", beneficio: "Ignora os componentes verbais da magia." },
  { nome: "Maximizar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Maximiza todas as variáveis numéricas dos efeitos da magia." },
  { nome: "Potencializar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Aumenta em 50% todas as variáveis numéricas dos efeitos da magia.", apelidos: ["Empoderar Magia"] },

  // --- Criação de itens ---
  { nome: "Criar Armaduras e Armas Mágicas", categoria: "Criação de itens", preRequisito: "5º nível de conjurador", beneficio: "Criar armas, armaduras e escudos mágicos.", apelidos: ["Criar Armas e Armaduras Mágicas"] },
  { nome: "Criar Bastão", categoria: "Criação de itens", preRequisito: "9º nível de conjurador", beneficio: "Criar bastões mágicos." },
  { nome: "Criar Cajado", categoria: "Criação de itens", preRequisito: "12º nível de conjurador", beneficio: "Criar cajados mágicos." },
  { nome: "Criar Item Maravilhoso", categoria: "Criação de itens", preRequisito: "3º nível de conjurador", beneficio: "Criar itens mágicos maravilhosos." },
  { nome: "Criar Varinha", categoria: "Criação de itens", preRequisito: "5º nível de conjurador", beneficio: "Criar varinhas mágicas." },
  { nome: "Escrever Pergaminho", categoria: "Criação de itens", preRequisito: "1º nível de conjurador", beneficio: "Criar pergaminhos mágicos." },
  { nome: "Forjar Anel", categoria: "Criação de itens", preRequisito: "12º nível de conjurador", beneficio: "Criar anéis mágicos." },
  { nome: "Preparar Poção", categoria: "Criação de itens", preRequisito: "3º nível de conjurador", beneficio: "Criar poções mágicas.", apelidos: ["Criar Poção"] },

  { nome: "Criar Construto", categoria: "Criação de itens", preRequisito: "Criar Item Maravilhoso, 11º nível de conjurador", beneficio: "Criar golens e outros constructos." },

  // --- Proficiência ---
  { nome: "Usar Arma Comum", categoria: "Proficiência", preRequisito: "", beneficio: "Não sofre penalidade nos ataques com uma arma comum específica.", apelidos: ["Usar Armas Marciais"] },
  { nome: "Usar Arma Exótica", categoria: "Proficiência", preRequisito: "Bônus base de ataque +1", beneficio: "Não sofre penalidade nos ataques com uma arma exótica específica.", apelidos: ["Usar Armas Exóticas"] },
  { nome: "Usar Arma Simples", categoria: "Proficiência", preRequisito: "", beneficio: "Não sofre penalidades nos ataques com armas simples.", apelidos: ["Usar Armas Simples"] },
  { nome: "Usar Armadura (leve)", categoria: "Proficiência", preRequisito: "", beneficio: "Não sofre penalidade de armadura nas jogadas de ataque.", apelidos: ["Usar Armadura Leve"] },
  { nome: "Usar Armadura (média)", categoria: "Proficiência", preRequisito: "", beneficio: "Não sofre penalidade de armadura nas jogadas de ataque.", apelidos: ["Usar Armadura Média"] },
  { nome: "Usar Armadura (pesada)", categoria: "Proficiência", preRequisito: "", beneficio: "Não sofre penalidade de armadura nas jogadas de ataque.", apelidos: ["Usar Armadura Pesada"] },
  { nome: "Usar Escudo", categoria: "Proficiência", preRequisito: "", beneficio: "Não sofre penalidade de armadura nas jogadas de ataque.", apelidos: ["Usar Escudos"] },
  { nome: "Usar Escudo de Corpo", categoria: "Proficiência", preRequisito: "Usar Escudo", beneficio: "Não sofre penalidade de armadura nas jogadas de ataque.", apelidos: ["Usar Escudo Corporal"] },

  // --- Estilo de armas (Livro Completo do Guerreiro, Tabela 3-4) ---
  { nome: "Alabarda Giratória", categoria: "Estilo", preRequisito: "Reflexos de Combate, Combater com Duas Armas, Foco em Arma (alabarda)", beneficio: "No ataque total com alabarda: +1 de esquiva na CA e um ataque adicional com −5, causando 1d6 + ½ do bônus de Força.", livro: "Livro Completo do Guerreiro" },
  { nome: "Bigorna do Trovão", categoria: "Estilo", preRequisito: "For 13, Separar Aprimorado, Ataque Poderoso, Combater com Duas Armas, Foco em Arma (martelo de guerra ou martelo leve), Foco em Arma (machado de batalha, machadinha ou machado de guerra dos anões)", beneficio: "Alvo atingido pelo martelo e pelo machado na mesma rodada fica pasmo por 1 rodada se falhar na Fortitude (CD 10 + ½ do nível + For).", livro: "Livro Completo do Guerreiro" },
  { nome: "Cajado Veloz", categoria: "Estilo", preRequisito: "Especialização em Combate, Esquiva, Combater com Duas Armas, Foco em Arma (cajado)", beneficio: "Empunhando um cajado, +2 de esquiva na CA somados à penalidade tomada em Especialização em Combate.", livro: "Livro Completo do Guerreiro" },
  { nome: "Espada Alta, Machado Baixo", categoria: "Estilo", preRequisito: "Imobilização Aprimorada, Combater com Duas Armas, Foco em Arma (espada bastarda, espada longa, espada curta ou cimitarra), Foco em Arma (machado de batalha, machadinha ou machado de guerra dos anões)", beneficio: "Tentativa de imobilização como ação livre contra o alvo atingido pela espada e pelo machado na mesma rodada.", livro: "Livro Completo do Guerreiro" },
  { nome: "Lâmina do Martelo", categoria: "Estilo", preRequisito: "For 15, Encontrão Aprimorado, Combater com Duas Armas, Foco em Arma (espada bastarda, espada longa ou cimitarra), Foco em Arma (martelo de guerra ou martelo leve)", beneficio: "Alvo atingido pelo martelo e pela espada na mesma rodada cai no chão se falhar na Fortitude (CD 10 + ½ do nível + For).", livro: "Livro Completo do Guerreiro" },
  { nome: "Lua Crescente", categoria: "Estilo", preRequisito: "Desarme Aprimorado, Combater com Duas Armas, Combater com Duas Armas Aprimorado, Foco em Arma (adaga), Foco em Arma (espada bastarda, espada longa, cimitarra ou espada curta)", beneficio: "Tentativa de desarme como ação livre contra o alvo atingido pela espada e pela adaga na mesma rodada.", livro: "Livro Completo do Guerreiro" },
  { nome: "Maça Relâmpago", categoria: "Estilo", preRequisito: "Reflexos de Combate, Combater com Duas Armas, Foco em Arma (maça leve)", beneficio: "Com uma maça em cada mão, um ataque adicional a cada ameaça de sucesso decisivo.", livro: "Livro Completo do Guerreiro" },
  { nome: "Presa do Urso", categoria: "Estilo", preRequisito: "For 15, Ataque Poderoso, Combater com Duas Armas, Foco em Arma (adaga), Foco em Arma (machado de batalha, machadinha ou machado de guerra dos anões)", beneficio: "Inicia Agarrar como ação livre, sem ataque de toque, contra o alvo atingido pelo machado e pela adaga na mesma rodada.", livro: "Livro Completo do Guerreiro" },
  { nome: "Rede e Tridente", categoria: "Estilo", preRequisito: "Des 15, Usar Arma Exótica (rede), Combater com Duas Armas, Foco em Arma (tridente)", beneficio: "Ação de rodada completa: arremessa a rede e, se prender o alvo, dá um passo de 1,5 m e desfere um ataque total com o tridente.", livro: "Livro Completo do Guerreiro" },
  { nome: "Três Montanhas", categoria: "Estilo", preRequisito: "For 13, Trespassar, Encontrão Aprimorado, Ataque Poderoso, Foco em Arma (maça pesada, clava grande ou maça-estrela)", beneficio: "Alvo atingido duas vezes na mesma rodada com a mesma arma de concussão fica enjoado por 1 rodada se falhar na Fortitude (CD 10 + ½ do nível + For).", livro: "Livro Completo do Guerreiro" },
];

export function talentoPor(nome: string): Talento | undefined {
  if (!nome) return undefined;
  const alvo = nome.toLowerCase();
  return TALENTOS.find(
    (t) =>
      t.nome.toLowerCase() === alvo ||
      t.apelidos?.some((a) => a.toLowerCase() === alvo),
  );
}
