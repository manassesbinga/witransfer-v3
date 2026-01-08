# Arquitetura e Estrutura do Projeto WiTransfer

Este documento define a organização de pastas e as regras de desenvolvimento do projeto.

## Estrutura de Pastas (`src/`)

### 1. `app/` (Next.js App Router)
Contém todas as rotas da aplicação, organizadas por grupos de rotas (route groups) para separar contextos.

*   **(public)/**: Rotas públicas acessíveis a todos os usuários (Home, Search, Booking).
*   **(private)/**: Rotas protegidas que exigem autenticação.
    *   **admin/**: Painel administrativo.
    *   **portal/**: Portal do cliente/parceiro.
*   **api/**: Rotas de API (Backend logic).

### 2. `actions/` (Server Actions)
Contém a lógica de servidor que pode ser chamada diretamente de componentes do cliente (Client Components). Substitui a necessidade de criar APIs para mutações simples.

### 3. `components/` (UI Library)
Componentes reutilizáveis da interface.
*   **ui/**: Componentes base do sistema de design (Botões, Inputs, Modais), geralmente baseados no Radix UI / Shadcn.
*   Outras pastas podem agrupar componentes específicos de funcionalidades (ex: `booking/`, `admin/`).

### 4. `lib/` (Utilities & Core)
Funções utilitárias, configurações e constantes globais.
*   `routes.ts`: Definição centralizada de todas as rotas (Single Source of Truth).
*   `db-admin.ts`: Configuração do banco de dados/Firebase admin.
*   `utils.ts`: Funções de ajuda (formatação de data, classes CSS).

### 5. `middlewares/` e `middleware.ts`
Lógica de interceptação de requisições, tratamento de autenticação e redirecionamentos.

## Regras de Desenvolvimento

### Formatação e Linting (Biome)
Utilizamos **Biome** (`biome.json`) no lugar de ESLint + Prettier para maior performance e simplicidade.

*   **Comando para formatar**: `npm run format` (ou `npx biome format --write .`)
*   **Comando para verificar erros**: `npm run lint`

### Padrões de Código
*   **Imports**: Usar caminhos absolutos com `@/` (se configurado no tsconfig) ou relativos organizados. O Biome organiza os imports automaticamente.
*   **Tipagem**: TypeScript estrito (noImplicitAny). Evite `any`.
*   **Commits**: Seguir o padrão Conventional Commits (feat, fix, docs, style, refactor).

### Variáveis de Ambiente
As variáveis sensíveis ficam no arquivo `.env.local` (não comitado). Exemplo de chaves necessárias:
*   `SMTP_*`: Configurações de envio de email.
*   `NEXT_PUBLIC_APP_URL`: URL base da aplicação.
