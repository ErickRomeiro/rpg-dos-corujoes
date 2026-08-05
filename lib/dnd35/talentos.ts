// Talentos do núcleo de D&D 3.5 (SRD).
//
// Guardamos nome, categoria, pré-requisito e um resumo curto do benefício —
// o suficiente para autocompletar o campo de talento na ficha e já trazer a
// observação preenchida. A regra completa fica nos livros do Compêndio.

export type Talento = {
  nome: string;
  categoria:
    | "Geral"
    | "Combate"
    | "Metamágico"
    | "Criação de itens"
    | "Proficiência";
  preRequisito: string;
  beneficio: string;
};

export const TALENTOS: Talento[] = [
  // --- Gerais que dão bônus de perícia ---
  { nome: "Acrobático", categoria: "Geral", preRequisito: "", beneficio: "+2 em Equilíbrio e Saltar." },
  { nome: "Afinidade com Animais", categoria: "Geral", preRequisito: "", beneficio: "+2 em Adestrar Animais e Cavalgar." },
  { nome: "Alerta", categoria: "Geral", preRequisito: "", beneficio: "+2 em Ouvir e Observar." },
  { nome: "Aptidão Mágica", categoria: "Geral", preRequisito: "", beneficio: "+2 em Identificar Magia e Usar Instrumento Mágico." },
  { nome: "Atlético", categoria: "Geral", preRequisito: "", beneficio: "+2 em Escalar e Natação." },
  { nome: "Autossuficiente", categoria: "Geral", preRequisito: "", beneficio: "+2 em Cura e Sobrevivência." },
  { nome: "Diligente", categoria: "Geral", preRequisito: "", beneficio: "+2 em Avaliação e Decifrar Escrita." },
  { nome: "Enganador", categoria: "Geral", preRequisito: "", beneficio: "+2 em Disfarce e Falsificação." },
  { nome: "Furtivo", categoria: "Geral", preRequisito: "", beneficio: "+2 em Esconder-se e Furtividade." },
  { nome: "Investigador", categoria: "Geral", preRequisito: "", beneficio: "+2 em Obter Informação e Procurar." },
  { nome: "Mãos Leves", categoria: "Geral", preRequisito: "", beneficio: "+2 em Abrir Fechaduras e Operar Mecanismo." },
  { nome: "Negociador", categoria: "Geral", preRequisito: "", beneficio: "+2 em Diplomacia e Sentir Motivação." },
  { nome: "Persuasivo", categoria: "Geral", preRequisito: "", beneficio: "+2 em Blefar e Intimidar." },
  { nome: "Prestidigitador", categoria: "Geral", preRequisito: "", beneficio: "+2 em Prestidigitação e Usar Cordas." },
  { nome: "Foco em Perícia", categoria: "Geral", preRequisito: "", beneficio: "+3 numa perícia à escolha." },

  // --- Gerais diversos ---
  { nome: "Fortitude Maior", categoria: "Geral", preRequisito: "", beneficio: "+2 em testes de Fortitude." },
  { nome: "Reflexos Rápidos", categoria: "Geral", preRequisito: "", beneficio: "+2 em testes de Reflexos." },
  { nome: "Vontade de Ferro", categoria: "Geral", preRequisito: "", beneficio: "+2 em testes de Vontade." },
  { nome: "Iniciativa Aprimorada", categoria: "Geral", preRequisito: "", beneficio: "+4 em testes de iniciativa." },
  { nome: "Rijeza", categoria: "Geral", preRequisito: "", beneficio: "+3 pontos de vida." },
  { nome: "Vitalidade", categoria: "Geral", preRequisito: "", beneficio: "+4 em testes prolongados de esforço físico." },
  { nome: "Inquebrantável", categoria: "Geral", preRequisito: "Vitalidade", beneficio: "Permanece consciente e agindo entre -1 e -9 PV." },
  { nome: "Correr", categoria: "Geral", preRequisito: "", beneficio: "Corre a 5× o deslocamento; +4 em Saltar com corrida." },
  { nome: "Rastrear", categoria: "Geral", preRequisito: "", beneficio: "Usa Sobrevivência para seguir rastros." },
  { nome: "Talento Adicional", categoria: "Geral", preRequisito: "", beneficio: "Um talento extra à escolha." },
  { nome: "Proeza Atlética", categoria: "Geral", preRequisito: "", beneficio: "+2 em dois testes físicos correlatos." },
  { nome: "Sortudo", categoria: "Geral", preRequisito: "", beneficio: "+1 em todos os testes de resistência." },
  { nome: "Influência Divina", categoria: "Geral", preRequisito: "Expulsar mortos-vivos", beneficio: "Usos adicionais de expulsão por dia." },

  // --- Combate ---
  { nome: "Ataque Poderoso", categoria: "Combate", preRequisito: "For 13", beneficio: "Troca bônus de ataque por dano, até o valor do BBA." },
  { nome: "Trespassar", categoria: "Combate", preRequisito: "Ataque Poderoso, For 13", beneficio: "Ataque extra ao derrubar um inimigo." },
  { nome: "Grande Trespassar", categoria: "Combate", preRequisito: "Trespassar, BBA +4", beneficio: "Trespassar sem limite de usos por rodada." },
  { nome: "Investida Aprimorada", categoria: "Combate", preRequisito: "Ataque Poderoso, For 13", beneficio: "+4 em empurrão; não provoca ataque de oportunidade." },
  { nome: "Atropelar Aprimorado", categoria: "Combate", preRequisito: "Ataque Poderoso, For 13", beneficio: "+4 para atropelar; o alvo não pode evitar." },
  { nome: "Esquiva", categoria: "Combate", preRequisito: "Des 13", beneficio: "+1 de CA contra um oponente escolhido." },
  { nome: "Mobilidade", categoria: "Combate", preRequisito: "Esquiva, Des 13", beneficio: "+4 de CA contra ataques de oportunidade ao se mover." },
  { nome: "Ataque Giratório", categoria: "Combate", preRequisito: "Mobilidade, Especialização em Combate, BBA +4", beneficio: "Um ataque contra cada inimigo adjacente." },
  { nome: "Investida Arrasadora", categoria: "Combate", preRequisito: "Mobilidade, BBA +4", beneficio: "+4 de dano ao investir." },
  { nome: "Especialização em Combate", categoria: "Combate", preRequisito: "Int 13", beneficio: "Troca bônus de ataque por CA, até 5 pontos." },
  { nome: "Derrubar Aprimorado", categoria: "Combate", preRequisito: "Especialização em Combate, Int 13", beneficio: "+4 para derrubar; ataque extra se derrubar." },
  { nome: "Desarmar Aprimorado", categoria: "Combate", preRequisito: "Especialização em Combate, Int 13", beneficio: "+4 para desarmar; não provoca ataque de oportunidade." },
  { nome: "Finta Aprimorada", categoria: "Combate", preRequisito: "Especialização em Combate, Int 13", beneficio: "Finta como ação de movimento." },
  { nome: "Agarrar Aprimorado", categoria: "Combate", preRequisito: "Golpe Desarmado Aprimorado, Des 13", beneficio: "+4 para agarrar; não provoca ataque de oportunidade." },
  { nome: "Golpe Desarmado Aprimorado", categoria: "Combate", preRequisito: "", beneficio: "Golpes desarmados causam dano letal e não provocam ataque de oportunidade." },
  { nome: "Reflexos de Combate", categoria: "Combate", preRequisito: "", beneficio: "Ataques de oportunidade extras iguais ao mod. de Des." },
  { nome: "Combater às Cegas", categoria: "Combate", preRequisito: "", beneficio: "Nova chance contra camuflagem; sem perder Des na escuridão." },
  { nome: "Crítico Aprimorado", categoria: "Combate", preRequisito: "Proficiência na arma, BBA +8", beneficio: "Dobra a margem de ameaça da arma." },
  { nome: "Foco em Arma", categoria: "Combate", preRequisito: "Proficiência na arma, BBA +1", beneficio: "+1 de ataque com a arma escolhida." },
  { nome: "Foco em Arma Maior", categoria: "Combate", preRequisito: "Foco em Arma, guerreiro nível 8", beneficio: "+1 de ataque adicional com a arma." },
  { nome: "Especialização em Arma", categoria: "Combate", preRequisito: "Foco em Arma, guerreiro nível 4", beneficio: "+2 de dano com a arma escolhida." },
  { nome: "Especialização em Arma Maior", categoria: "Combate", preRequisito: "Especialização em Arma, guerreiro nível 12", beneficio: "+2 de dano adicional com a arma." },
  { nome: "Combate com Duas Armas", categoria: "Combate", preRequisito: "Des 15", beneficio: "Reduz as penalidades de atacar com duas armas." },
  { nome: "Combate com Duas Armas Aprimorado", categoria: "Combate", preRequisito: "Combate com Duas Armas, Des 17, BBA +6", beneficio: "Ataque extra com a arma secundária." },
  { nome: "Combate com Duas Armas Superior", categoria: "Combate", preRequisito: "Combate com Duas Armas Aprimorado, Des 19, BBA +11", beneficio: "Terceiro ataque com a arma secundária." },
  { nome: "Defesa com Duas Armas", categoria: "Combate", preRequisito: "Combate com Duas Armas, Des 15", beneficio: "+1 de escudo na CA ao usar duas armas." },
  { nome: "Saque Rápido", categoria: "Combate", preRequisito: "BBA +1", beneficio: "Sacar arma como ação livre." },
  { nome: "Tiro Certeiro", categoria: "Combate", preRequisito: "", beneficio: "+1 de ataque e dano a até 9 m." },
  { nome: "Tiro Preciso", categoria: "Combate", preRequisito: "Tiro Certeiro", beneficio: "Sem penalidade ao atirar em combate corpo a corpo." },
  { nome: "Tiro Preciso Aprimorado", categoria: "Combate", preRequisito: "Tiro Preciso, Des 19, BBA +11", beneficio: "Ignora cobertura e camuflagem parciais." },
  { nome: "Rapidez de Disparo", categoria: "Combate", preRequisito: "Tiro Certeiro, Des 13", beneficio: "Um disparo extra por rodada, com -2 em todos." },
  { nome: "Disparo Múltiplo", categoria: "Combate", preRequisito: "Rapidez de Disparo, Des 17, BBA +6", beneficio: "Dispara duas flechas num só ataque." },
  { nome: "Tiro à Queima-Roupa", categoria: "Combate", preRequisito: "Tiro Certeiro, BBA +4", beneficio: "Disparo não provoca ataque de oportunidade." },
  { nome: "Aparar Projéteis", categoria: "Combate", preRequisito: "Golpe Desarmado Aprimorado, Des 13", beneficio: "Desvia um projétil por rodada." },
  { nome: "Rebater Projéteis", categoria: "Combate", preRequisito: "Aparar Projéteis, Des 13, BBA +5", beneficio: "Devolve o projétil desviado ao atacante." },
  { nome: "Combate Montado", categoria: "Combate", preRequisito: "Cavalgar 1 graduação", beneficio: "Anula um ataque contra a montaria por rodada." },
  { nome: "Ataque Montado", categoria: "Combate", preRequisito: "Combate Montado", beneficio: "Ataca sem penalidade após mover a montaria." },
  { nome: "Investida Montada", categoria: "Combate", preRequisito: "Combate Montado", beneficio: "Dobra o crítico da lança montada ao investir." },
  { nome: "Disparo Montado", categoria: "Combate", preRequisito: "Combate Montado, Cavalgar 1 graduação", beneficio: "Reduz penalidades de atirar montado." },

  // --- Metamágicos ---
  { nome: "Ampliar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Dobra o alcance. Ocupa espaço 1 nível acima." },
  { nome: "Estender Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Dobra a duração. Ocupa espaço 1 nível acima." },
  { nome: "Elevar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Conjura como se fosse de nível mais alto (CD maior)." },
  { nome: "Empoderar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "+50% nos valores variáveis. Ocupa espaço 2 níveis acima." },
  { nome: "Maximizar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Valores variáveis no máximo. Ocupa espaço 3 níveis acima." },
  { nome: "Acelerar Magia", categoria: "Metamágico", preRequisito: "", beneficio: "Conjura como ação livre. Ocupa espaço 4 níveis acima." },
  { nome: "Magia Silenciosa", categoria: "Metamágico", preRequisito: "", beneficio: "Dispensa componente verbal. Ocupa espaço 1 nível acima." },
  { nome: "Magia Imóvel", categoria: "Metamágico", preRequisito: "", beneficio: "Dispensa componente somático. Ocupa espaço 1 nível acima." },
  { nome: "Ampliar Área", categoria: "Metamágico", preRequisito: "", beneficio: "Dobra a área de efeito. Ocupa espaço 3 níveis acima." },
  { nome: "Foco em Magia", categoria: "Geral", preRequisito: "", beneficio: "+1 na CD das magias de uma escola." },
  { nome: "Foco em Magia Maior", categoria: "Geral", preRequisito: "Foco em Magia", beneficio: "+1 adicional na CD daquela escola." },
  { nome: "Magia Penetrante", categoria: "Geral", preRequisito: "", beneficio: "+2 para superar resistência a magia." },
  { nome: "Magia Penetrante Maior", categoria: "Geral", preRequisito: "Magia Penetrante", beneficio: "+2 adicional para superar resistência a magia." },
  { nome: "Conjuração Rápida", categoria: "Geral", preRequisito: "Concentração 15 graduações", beneficio: "Reduz o tempo de conjuração." },
  { nome: "Conjuração Defensiva", categoria: "Geral", preRequisito: "Concentração 4 graduações", beneficio: "+4 em Concentração para conjurar sob ameaça." },
  { nome: "Prontidão Mágica", categoria: "Geral", preRequisito: "Conjurador arcano nível 5", beneficio: "Deixa espaços de magia em aberto para preencher depois." },

  // --- Criação de itens ---
  { nome: "Escrever Pergaminho", categoria: "Criação de itens", preRequisito: "Conjurador nível 1", beneficio: "Cria pergaminhos mágicos." },
  { nome: "Criar Poção", categoria: "Criação de itens", preRequisito: "Conjurador nível 3", beneficio: "Cria poções de magias de até 3º nível." },
  { nome: "Criar Varinha", categoria: "Criação de itens", preRequisito: "Conjurador nível 5", beneficio: "Cria varinhas de magias de até 4º nível." },
  { nome: "Criar Armas e Armaduras Mágicas", categoria: "Criação de itens", preRequisito: "Conjurador nível 5", beneficio: "Cria armas, armaduras e escudos mágicos." },
  { nome: "Criar Item Maravilhoso", categoria: "Criação de itens", preRequisito: "Conjurador nível 3", beneficio: "Cria itens maravilhosos." },
  { nome: "Criar Bastão", categoria: "Criação de itens", preRequisito: "Conjurador nível 9", beneficio: "Cria bastões mágicos." },
  { nome: "Criar Cajado", categoria: "Criação de itens", preRequisito: "Conjurador nível 12", beneficio: "Cria cajados mágicos." },
  { nome: "Forjar Anel", categoria: "Criação de itens", preRequisito: "Conjurador nível 12", beneficio: "Cria anéis mágicos." },
  { nome: "Criar Construto", categoria: "Criação de itens", preRequisito: "Conjurador nível 11", beneficio: "Cria golens e outros constructos." },

  // --- Proficiências ---
  { nome: "Usar Armas Simples", categoria: "Proficiência", preRequisito: "", beneficio: "Proficiência com todas as armas simples." },
  { nome: "Usar Armas Marciais", categoria: "Proficiência", preRequisito: "", beneficio: "Proficiência com uma arma marcial." },
  { nome: "Usar Armas Exóticas", categoria: "Proficiência", preRequisito: "BBA +1", beneficio: "Proficiência com uma arma exótica." },
  { nome: "Usar Armadura Leve", categoria: "Proficiência", preRequisito: "", beneficio: "Sem penalidade de não-proficiência com armadura leve." },
  { nome: "Usar Armadura Média", categoria: "Proficiência", preRequisito: "Usar Armadura Leve", beneficio: "Sem penalidade com armadura média." },
  { nome: "Usar Armadura Pesada", categoria: "Proficiência", preRequisito: "Usar Armadura Média", beneficio: "Sem penalidade com armadura pesada." },
  { nome: "Usar Escudos", categoria: "Proficiência", preRequisito: "", beneficio: "Sem penalidade ao usar escudos." },
  { nome: "Usar Escudo Corporal", categoria: "Proficiência", preRequisito: "Usar Escudos", beneficio: "Permite usar escudo corporal sem penalidade extra." },
];

export function talentoPor(nome: string): Talento | undefined {
  return TALENTOS.find((t) => t.nome === nome);
}
