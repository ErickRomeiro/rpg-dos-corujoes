# 🎲 RPG dos Corujões

> Plataforma web para grupos de RPG de mesa gerenciarem campanhas, personagens e material de jogo em um só lugar. Nasceu para o meu próprio grupo — os Corujões — e continua evoluindo com uso real.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

🌐 **Demo:** [rpg-dos-corujoes.vercel.app](https://rpg-dos-corujoes.vercel.app)

---

## 📸 Preview

| Login | Seleção de sistema | Mesas |
|---|---|---|
| ![Tela de login](./docs/preview-login.png) | ![Seleção de sistema](./docs/preview-sistemas.png) | ![Minhas mesas](./docs/preview-mesas.png) |
| Login com Google | Escolha de sistema de RPG | Gestão de mesas do usuário |

Fluxo real: login com Google → escolha do sistema de RPG → gestão das mesas do usuário.

---

## ✨ O que faz hoje

- 🔐 **Autenticação Google** via Auth.js v5, com sessões persistidas no PostgreSQL
- 🎯 **Multi-sistema por design** — arquitetura pronta para múltiplos sistemas de RPG (D&D 3.5 implementado; outros virão)
- 🎲 **Sistema de mesas (campanhas)** — criar, listar, gerenciar membros
- 👥 **Papéis por mesa** — mestre e jogador atribuídos independentemente do papel global no site
- 🔎 **Adicionar membros via busca por nome** (autocomplete), não precisa saber o e-mail
- 📋 **Ficha de personagem completa** de D&D 3.5 — atributos, combate, resistências, as 35 perícias do SRD com total calculado automaticamente, armas, talentos, equipamento, dinheiro e magias
- 👁️ **Leitura e edição separadas** — abrir a ficha mostra a leitura, feita para conferir e imprimir; editar é um passo à parte, e cada salvamento grava só o que mudou, com histórico
- 🌐 **Link público revogável** — `/f/[token]` abre a ficha para quem não tem conta, e o token pode ser derrubado a qualquer momento
- 🖼️ **Retrato e carta de personagem** — envio de imagem com ajuste de enquadramento, e uma carta que abre a leitura da ficha ao lado das tabelas
- 🐉 **Painel do mestre** — visão consolidada das fichas da mesa: PV, CA, iniciativa, resistências e os totais das perícias que o mestre rola em segredo, com dano e cura aplicados direto no painel
- ⚔️ **Rastreador de iniciativa** — a fila do combate com os personagens da mesa e os monstros que o mestre acrescenta na hora; ordem pela regra do 3.5 (empate resolve pelo maior modificador), contador de rodada, e PV na própria linha
- 🔗 **Vinculação ficha ↔ mesa** — cada jogador entra na mesa com sua ficha
- 🎯 **Rolador de dados** — expressões como `2d6+1d4+2`, detalhe de cada dado, destaque de 20/1 natural e histórico da sessão
- 📚 **Compêndio integrado** — abre o catálogo de dados do sistema, além dos links para os livros oficiais
- 📖 **Catálogo de dados de jogo** — magias, talentos, armas e armaduras, divindades, domínios, raças e classes transcritos do Livro do Jogador, do Livro Completo do Arcano e do Livro Completo do Guerreiro
- 🏠 **Homebrew por mesa** — cada campanha acrescenta os próprios itens ao catálogo, sem tocar no material oficial
- 🔍 **Busca tolerante** — acha pelo nome em inglês e ignora acento ("agua" encontra "Água")
- 🛡️ **Papel global OWNER/USER** — dono do site promovido automaticamente por variável de ambiente

## 🚧 Em desenvolvimento

Projeto em fase ativa — funcionalidades chegam conforme o grupo usa e pede.

**Feito:**
- [x] Dados estruturados de raças, classes e magias (não só links)
- [x] Compartilhamento de ficha via link público
- [x] Rastreador de iniciativa e combate no painel do mestre

**Próximo:**
- [ ] Condições de combate com duração em rodadas (enfeitiçado, atordoado, caído…)
- [ ] Suporte a novos sistemas além de D&D 3.5

---

## 🛠️ Stack

**Framework**
- [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- [React 19](https://react.dev)
- [TypeScript 5](https://www.typescriptlang.org)

**Backend & Dados**
- [Prisma 7](https://www.prisma.io) + adapter PostgreSQL
- [Neon](https://neon.tech) — PostgreSQL serverless
- [Vercel Blob](https://vercel.com/docs/vercel-blob) — retratos das fichas
- Server Actions do Next para mutations

**Autenticação**
- [Auth.js v5](https://authjs.dev) (NextAuth) com provider Google
- Sessões em banco via adaptador Prisma
- Proxy customizado (`proxy.ts`) como gate de rotas protegidas

**UI**
- [Tailwind CSS 4](https://tailwindcss.com)

---

## 🏗️ Arquitetura

```
app/
├── entrar/                      # Login
├── f/[token]/                   # Ficha em link público, sem login
├── dnd35/                       # Namespace do sistema D&D 3.5
│   ├── mesas/                   # Campanhas
│   │   ├── nova/                # Criar mesa
│   │   └── [id]/                # Detalhe da mesa
│   │       └── catalogo/        # Homebrew da mesa
│   ├── fichas/                  # Personagens
│   │   ├── nova/                # Criar ficha
│   │   └── [id]/                # Leitura da ficha
│   │       ├── carta/           # Carta de personagem
│   │       └── editar/          # Edição da ficha
│   ├── catalogo/                # Dados de jogo do sistema
│   ├── compendio/[tipo]/        # Catálogo por tipo + livros
│   ├── mestre/[id]/             # Painel do mestre, por mesa
│   └── utilitarios/             # Ferramentas de mesa
└── api/
    ├── auth/[...nextauth]/      # Auth.js
    └── usuarios/
        ├── buscar/              # Autocomplete de usuários
        └── fichas/              # API de fichas
```

**Escolhas de design que importam:**

- **Autorização em dois níveis** — papel global (`OWNER`/`USER`) na tabela `User` + papel por mesa (`MESTRE`/`JOGADOR`) em `MembroMesa`. Separação intencional: quem é mestre em uma mesa pode ser jogador em outra.
- **Rotas prefixadas por sistema** (`/dnd35/*`) — adicionar Tormenta20 ou outro sistema é criar o namespace irmão, sem quebrar o que existe.
- **Proxy em vez de middleware padrão** — checagem otimista de cookie de sessão. Autorização "de verdade" (o que cada papel pode ver/editar) vive junto aos dados.
- **Ficha desacoplada da mesa** — uma ficha pertence ao usuário e é vinculada à mesa via `MembroMesa`. Permite portar personagem entre campanhas.

---

## 🚀 Rodando localmente

**Requisitos:** Node.js 20+, PostgreSQL (local ou Neon), conta Google Cloud para OAuth.

```bash
# 1. Clone e instale
git clone https://github.com/ErickRomeiro/rpg-dos-corujoes.git
cd rpg-dos-corujoes
npm install

# 2. Configure variáveis de ambiente
cp .env.example .env.local
# Preencha .env.local com:
#   DATABASE_URL         → Connection string do Postgres (Neon ou local)
#   AUTH_SECRET          → openssl rand -base64 32
#   AUTH_GOOGLE_ID       → Client ID do Google Cloud
#   AUTH_GOOGLE_SECRET   → Client Secret do Google Cloud
#   OWNER_EMAILS         → Seu e-mail (vira OWNER automaticamente)
#   BLOB_*               → Opcional: store Public do Vercel Blob, para os
#                          retratos das fichas (sem ele, só o envio de
#                          retrato fica indisponível)

# 3. Prepare o banco
# (sincroniza o schema e cria a extensão unaccent, que a busca do catálogo usa
#  para "agua" achar "Água")
npm run db:push

# 4. Rode em desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

**Scripts úteis:**

```bash
npm run db:generate       # Regenera Prisma Client
npm run db:push           # Sincroniza schema com o banco (+ extensão da busca)
npm run db:busca          # Só a extensão unaccent, se precisar rodar isolada
npm run db:seed           # Popula o catálogo com o material dos livros
npm run db:studio         # Abre Prisma Studio (GUI do banco)
npm run catalogo:limpar   # Remove o que o seed deixa para trás
npm run tabelas:conferir  # Confere as tabelas do catálogo
npm run links:checar      # Verifica os links do Compêndio
```

---

## 📖 Origem

Nasceu para o meu grupo de RPG — os Corujões. A gente jogava sistemas diferentes e o vai-e-vem entre PDFs, planilhas do Google e cadernos manuscritos ficou insustentável. Este projeto é a solução prática, construída em cima do problema real e evoluída com feedback direto de quem usa.

---

## 📄 Licença

MIT — livre para usar, adaptar e aprender.

---

**Feito por [Erick Gabriel de Souza Romeiro](https://github.com/ErickRomeiro)** em Campo Grande, MS.
