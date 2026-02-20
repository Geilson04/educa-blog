# Relatório – educablog MVP

## Resumo executivo

O educablog é um MVP concebido para apoiar docentes de escolas públicas brasileiras na criação, distribuição e acompanhamento de atividades escolares em ambiente digital. A plataforma visa reduzir a carga administrativa, aumentar o engajamento dos estudantes e incentivar a colaboração entre professores. O MVP apresenta um fluxo simples, porém funcional, que permite a um docente cadastrar‑se, criar uma atividade e atribuí‑la a seus alunos, enquanto estes podem acessar o conteúdo e enviar suas respostas.

## Problema e justificativa

Professoras e professores da rede pública frequentemente enfrentam desafios como:

- **Falta de ferramentas digitais adequadas** para criar e compartilhar conteúdos educativos.
- **Baixo engajamento** de estudantes em ambientes virtuais, principalmente em contextos de ensino remoto ou híbrido.
- **Gestão manual de tarefas** que consome tempo (acompanhamento de entregas, correções, comunicação individual).

Ao oferecer um ambiente unificado, em português, com login unificado para docentes e alunos, o educablog busca reduzir essas dores e promover a inclusão digital no contexto educacional público.

## Descrição da solução

O MVP implementa um fluxo end‑to‑end que contempla as principais atividades de um docente:

1. **Cadastro e login:** usuários podem registrar‑se como docente ou aluno e autenticar‑se via email e senha. A segurança é tratada com JWTs e hashing de senhas.
2. **Painel do docente:** após o login, o docente acessa um dashboard onde cria novas atividades (título, descrição e conteúdo) e as atribui a estudantes específicos. O painel lista atividades existentes e exibe quais alunos já foram atribuídos.
3. **Visão do aluno:** estudantes autenticados visualizam as atividades atribuídas, leem o conteúdo e enviam suas respostas. O status de cada atividade é atualizado para **Pendente** ou **Enviado** conforme a interação.

O front‑end foi desenvolvido com React/Next.js, utilizando o App Router e gerenciamento de estado via Zustand e React Query. O design responsivo e acessível foi implementado com Tailwind CSS. No backend, uma API Express expõe rotas REST, com o banco de dados PostgreSQL orquestrado pelo Prisma ORM.

## Processo de desenvolvimento

### Brainstorming e design thinking

1. **Pesquisa de contexto:** levantamento das dores de docentes da rede pública (criação de atividades, correções, comunicação).\
2. **Definição de personas:** identificação de dois perfis principais – o **docente** que precisa organizar e compartilhar conteúdos, e o **aluno** que precisa receber e entregar suas tarefas.\
3. **Ideação de funcionalidades:** priorização de recursos que atendessem ao escopo de um MVP, com foco na criação/atribuição de atividades e na simplicidade de uso.\
4. **Protótipo no Figma:** criação de telas de login, dashboard do docente e visão do aluno, garantindo textos e interações em português e boa usabilidade em dispositivos desktop e móveis.

### Implementação técnica

- **Arquitetura:** a aplicação foi dividida em camadas claras: API (Express + Prisma), banco de dados (PostgreSQL) e front‑end (Next.js). Os diretórios são organizados para facilitar a manutenção: `server/src` para código da API e `web/src` para o front‑end.\
- **Banco de dados:** o schema Prisma define modelos `User`, `Activity` e `StudentActivity`, com relacionamentos que permitem que um docente tenha várias atividades e que cada atividade seja associada a múltiplos estudantes.\
- **Autenticação:** implementação de cadastro e login via JWT, com middleware de proteção (`authenticate`) e checagem de papel (`requireRole`). Senhas são hashadas com bcrypt.\
- **Camada REST:** controladores tratam validação (usando Zod), manipulação via Prisma e retorno de erros amigáveis em português.\
- **Frontend:** uso do Next App Router com separação clara entre rotas públicas (`/login`) e privadas (`/dashboard`, `/aluno`). Zustand armazena o usuário atual e token, enquanto React Query gerencia requisições e cache.\
- **Estilo e acessibilidade:** Tailwind CSS padroniza o design. Elementos possuem foco claro, contraste adequado e labels/arías em português.

## Detalhes técnicos

### Diagrama de arquitetura

```
          +-------------+      HTTP       +---------------+       SQL        +---------------+
          |  Frontend   |  <---------->  |    API REST   | <--------->  |  PostgreSQL   |
          |  (Next.js)  |                | (Express/TS)  |             |   (Prisma)    |
          +-------------+                +---------------+             +---------------+
                 |                              |                           |
                 |  JWT + JSON                  |                           |
                 +------------------------------>+                           |
```

### Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Zustand, React Query, Axios.
- **Backend:** Node.js 18, Express, TypeScript, Prisma ORM, PostgreSQL.
- **Database:** PostgreSQL com migrations gerenciadas via Prisma.
- **Testes:** Vitest para unitários e scripts de smoke test (não inclusos por limitação de tempo).
- **Ferramentas adicionais:** ESLint, Prettier, Husky (sugerido), CI com GitHub Actions (sugerido).

### API (resumo)

| Verbo/rota                                    | Função                                     |
|----------------------------------------------|--------------------------------------------|
| `POST /auth/register`                        | Cria um usuário (docente ou aluno)         |
| `POST /auth/login`                           | Retorna token e dados do usuário           |
| `GET /users/me`                              | Perfil do usuário autenticado              |
| `GET /users/students`                        | Lista alunos (docente)                     |
| `POST /activities`                           | Cria nova atividade (docente)              |
| `GET /activities/mine`                       | Lista atividades do docente                |
| `GET /activities/student`                    | Lista atividades atribuídas ao aluno       |
| `POST /activities/:id/assign`                | Atribui alunos a uma atividade (docente)   |
| `POST /activities/assignment/:id/submit`     | Envia resposta de uma atividade (aluno)    |

## Aprendizados e próximos passos

O desenvolvimento deste MVP reforçou a importância de um escopo enxuto e de decisões de arquitetura bem definidas. Algumas lições aprendidas foram:

- **Organização de rotas** no Next App Router requer atenção para evitar colisões; usar grupos (entre parênteses) ajuda a manter URLs limpas.
- **Localização**: escrever todo o texto da interface em português aumenta a identificação dos usuários e evidencia a necessidade de considerar a língua durante o desenvolvimento.
- **Adoção de ferramentas modernas** como React Query e Prisma reduz a quantidade de código boilerplate e acelera a iteração.

Como próximos passos, sugerem‑se:

1. **Melhorar a experiência do aluno**, incluindo correção automática de exercícios objetivos e feedback imediato.
2. **Criar uma área de comunidade para docentes**, permitindo compartilhamento de materiais e discussões.
3. **Implementar notificações por e‑mail** para avisar alunos sobre novas atividades e prazos de entrega.
4. **Adicionar gamificação** (pontuações e medalhas) para aumentar o engajamento.
5. **Estender os testes automatizados**, incluindo testes de integração e end‑to‑end com Playwright.


*Este relatório faz parte da entrega do hackathon 5FSDT e descreve o planejamento, implementação e resultados obtidos durante a criação do MVP educablog.*