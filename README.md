# educablog – MVP para Docentes e Alunos da Rede Pública


## 📄 Relatório do Projeto

O relatório detalhado do MVP, incluindo contexto, decisões de arquitetura e próximos passos, está disponível em:

- [`report.md`](./report.md)

Este repositório contém o código‑fonte de um MVP que auxilia docentes de escolas públicas brasileiras na criação e compartilhamento de atividades, acompanhamento de estudantes e gestão de conteúdos. O projeto é dividido em duas aplicações: uma **API** (backend) escrita com Node.js/Express/Prisma e um **frontend** web construído com React, Next.js e Tailwind CSS.

## 📦 Estrutura do repositório

```
.
├─ server/   # API REST em Node.js + Express + Prisma + PostgreSQL
├─ web/      # Aplicação Next.js (App Router) com React e Tailwind
└─ README.md # Este documento
```

### `server`

O backend expõe rotas para autenticação (`/auth`), gestão de usuários (`/users`) e gerenciamento de atividades (`/activities`). Ele utiliza **PostgreSQL** como banco de dados via **Prisma ORM**. As principais rotas são:

- `POST /auth/register` – cria docente ou aluno
- `POST /auth/login` – autentica e retorna JWT
- `GET /users/me` – retorna perfil do usuário autenticado
- `GET /users/students` – lista alunos (apenas docentes)
- `POST /activities` – cria nova atividade (docente)
- `GET /activities/mine` – lista atividades do docente
- `GET /activities/student` – lista atividades atribuídas ao aluno
- `POST /activities/:id/assign` – atribui alunos a uma atividade
- `POST /activities/assignment/:assignmentId/submit` – envia submissão do aluno

### `web`

A aplicação Next.js utiliza o **App Router** e organiza suas páginas da seguinte forma:

- `src/app/page.tsx` – redireciona para `/login`.
- `src/app/(auth)/login/page.tsx` – tela de login/cadastro.
- `src/app/(dashboard)/dashboard/page.tsx` – painel do docente (criar e atribuir atividades).
- `src/app/aluno/page.tsx` – painel do aluno (visualizar e responder atividades).

O estado de autenticação é gerenciado com **Zustand** e os dados remotos são consumidos via **Axios** e **React Query**. O design foi construído com **Tailwind CSS** e procura seguir boas práticas de acessibilidade.

## 🚀 Como executar o projeto

> **Pré‑requisitos:** [Node.js](https://nodejs.org/) (v18 ou superior) e [PostgreSQL](https://www.postgresql.org/) em execução. Você também precisará do `npm` ou `yarn` para instalar dependências.

1. **Clone o repositório** e acesse cada pasta em terminais separados:

```bash
git clone <repo-url>
cd educa-blog
```

2. **Backend**

```bash
cd server

# Instalar dependências
npm ci

# Copie o arquivo de exemplo de ambiente e ajuste as variáveis conforme seu PostgreSQL
cp .env.example .env

# Gerar client do Prisma e aplicar migrações
npx prisma generate
npx prisma migrate dev --name init

# (Opcional) popular o banco com dados de exemplo
npm run seed

# Iniciar a API
npm run dev
```

A API ficará acessível em `http://localhost:3001`.

3. **Frontend**

Em outro terminal:

```bash
cd web

# Instalar dependências
npm ci

# Criar arquivo `.env.local` definindo a URL da API
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação web será servida em `http://localhost:3000`. Acesse `/login` para entrar ou criar uma conta. Docentes são redirecionados para `/dashboard` e alunos para `/aluno` após o login.

> **Observação:** o fluxo de autenticação utiliza JWT armazenado em `localStorage`. Para encerrar a sessão, basta clicar em **Sair** no cabeçalho.


## 👨‍💻 Scripts úteis

### Backend (`server`)

- `npm run dev` – inicia a API em modo desenvolvimento com [Nodemon](https://nodemon.io/).
- `npm run build` – compila o TypeScript em `dist/`.
- `npm run start` – executa o código compilado.
- `npm run lint` – roda o ESLint.
- `npm run typecheck` – executa o TypeScript em modo de verificação (sem emitir arquivos).
- `npm run migrate` – aplica a migração inicial do Prisma.
- `npm run generate` – gera o client do Prisma.
- `npm run seed` – popula o banco com dados de exemplo (docente/aluno/atividade).

### Frontend (`web`)

- `npm run dev` – inicia o servidor de desenvolvimento do Next.js.
- `npm run build` – cria a versão de produção da aplicação.
- `npm run start` – serve a build gerada.
- `npm run lint` – roda o ESLint.
- `npm run typecheck` – checa os tipos sem emitir arquivos.
- `npm run format` – formata o código com Prettier.
- `npm run test` – executa testes (Vitest).

## ✅ Próximos passos e melhorias

Este MVP prova o valor de uma plataforma simplificada para professores e estudantes da rede pública. Para evoluir a solução, sugerem‑se as seguintes melhorias:

- ✅ **Feedback automático** das atividades submetidas, com correção automática de quizzes e rubric para textos.
- ✅ **Gamificação**: adicionar pontos, medalhas e ranking para aumentar o engajamento dos alunos.
- ✅ **Comunidades de docentes**: fórum integrado para compartilhar boas práticas, materiais e dúvidas.
- ✅ **Inclusão digital**: suporte a acessibilidade, responsividade e funcionamento offline/PWA.
- ✅ **Integração com calendários** para gerenciar datas de entrega e eventos escolares.

## 📄 Relatório detalhado

Um relatório completo descrevendo a motivação, o processo de design, decisões de arquitetura e próximos passos acompanha este repositório. Consulte o arquivo **report.md** para uma análise mais profunda.

---

💡 *Projeto desenvolvido para o hackathon 5FSDT, atendendo às exigências de stack e de qualidade listadas no briefing.*