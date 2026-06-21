# Score Insight

Painel operacional web para leitura executiva de clientes, com foco em `financeiro`, `vendas` e `estoque`, autenticação via Supabase e suporte a operação `multi-tenant`.

## Visão Geral

O `Score Insight` foi construído para consolidar indicadores operacionais em uma interface única, com navegação simples, filtros globais e controle de acesso por perfil.

Hoje o sistema entrega:

- login com `Supabase Auth`
- vínculo de acesso por usuário em `insight_profiles` e `insight_user_roles`
- escopo por cliente com diferenciação entre `admin` e `user`
- dashboard geral com leitura consolidada
- módulos específicos de `Financeiro`, `Vendas` e `Estoque`
- tela administrativa para gestão de usuários
- modo de simulação de usuário com retorno ao administrador original

## Como Funciona

### Autenticação e acesso

- o login acontece pelo `Supabase Auth`
- após autenticar, o app consulta `insight_profiles`
- o papel do usuário é definido em `insight_user_roles`
- `admin` pode visualizar qualquer cliente ativo
- `user` fica restrito ao cliente vinculado em `insight_profiles.empresa_id`

### Multi-tenant

- os clientes ficam centralizados em `gigatech_clientes_config`
- o filtro global do sistema considera `empresa`, `mês` e `ano`
- as funções remotas validam o usuário autenticado antes de devolver dados

### Módulos

- `Geral`: visão resumida do negócio
- `Financeiro`: DRE, composição e leitura executiva
- `Vendas`: faturamento, vendedores, departamentos e vendas por dia
- `Estoque`: leitura de itens, valor investido e departamentos
- `Configurações`: gestão de usuários para administradores

## Arquitetura

### Frontend

- `React`
- `TypeScript`
- `Vite`
- `Zustand`
- `Tailwind CSS`
- `React Router`

### Backend e integrações

- `Supabase Auth`
- `Supabase Edge Functions`
- `Cashtrack`
- tabelas `gigatech_*` para vendas e estoque

### Edge Functions em uso

- `cashtrack-finance-new`
- `formen-sales_new`
- `formen-stock_new`
- `manage-users-new`

As versões legadas antigas foram preservadas para não impactar outros sistemas.

## Estrutura Principal

```text
src/
  components/
  hooks/
  lib/
  pages/
  store/
  utils/
sql/
  001_insight_auth.sql
  002_seed_insight_access.sql
  003_gigatech_companies_rls.sql
```

## Requisitos

- `Node.js 20+`
- `npm`
- projeto Supabase configurado
- tabelas e functions do ambiente já publicadas

## Variáveis de Ambiente

Crie um arquivo `.env` local com base no `.env.example`.

Variáveis obrigatórias:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Scripts úteis

```bash
npm run check
npm run lint
npm run test
npm run build
```

## Deploy na Vercel

O projeto está pronto para deploy na Vercel.

Foi adicionado um `vercel.json` com rewrite para `index.html`, necessário porque a aplicação usa `BrowserRouter` e rotas como:

- `/dashboard`
- `/dashboard/financeiro`
- `/dashboard/vendas`
- `/dashboard/estoque`
- `/dashboard/configuracoes`

Sem esse rewrite, abrir uma rota diretamente na Vercel poderia gerar `404`.

### Build esperado

- comando de build: `npm run build`
- diretório de saída: `dist`

## Variáveis na Vercel

Sim, você precisa cadastrar as variáveis de ambiente também na Vercel.

Isso é necessário porque o frontend usa `import.meta.env` no build do Vite, e o cliente Supabase é inicializado com essas variáveis.

Cadastre no projeto da Vercel:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Se essas variáveis não estiverem configuradas no deploy, o app falha ao iniciar.

## Segurança para GitHub

Antes de subir o repositório:

- mantenha `.env` fora do versionamento
- mantenha `.trae/` fora do versionamento
- nunca envie chaves reais do Supabase
- revise se não existe nenhum token colado em arquivos de documentação

O `.gitignore` já foi ajustado para cobrir:

- `.env`
- `.env.*`
- `.trae/`
- `.vercel/`

## SQL de apoio

Os scripts em `sql/` ajudam na estrutura do acesso e da leitura por cliente:

- `001_insight_auth.sql`: estrutura base de autenticação
- `002_seed_insight_access.sql`: seed de acesso inicial
- `003_gigatech_companies_rls.sql`: política de leitura das empresas no frontend autenticado

## Observações

- o módulo financeiro atual usa uma estrutura de DRE baseada em grupos mapeados no frontend
- a simulação de usuário preserva a sessão original do administrador para retorno rápido
- a área administrativa depende da Edge Function `manage-users-new`
