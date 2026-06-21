# Agent.md - Score Insight

## 1. Ideia do Projeto
Construir o Score Insight como um sistema web autenticado para a For Men Prime, centralizando indicadores de financeiro, vendas e estoque em uma única interface moderna, rápida e confiável.

## 2. Objetivo desta execução
- Criar a documentação-base do projeto.
- Inicializar o frontend.
- Implementar autenticação local funcional, preparada para futura troca por Supabase.
- Padronizar o uso futuro de tabelas de perfil e papéis com prefixo `insight_`.
- Entregar um sistema funcional com tela de login, área protegida e módulos principais integrados.

## 3. Premissas validadas
- Projeto Supabase remoto: `lunsyufvxkiivnrhpxpj`
- Variáveis públicas já disponíveis no arquivo `.env`
- A documentação pública principal do projeto está em `README.md`
- O sistema não será conectado ao Supabase nesta etapa
- Sempre que houver criação de schema, o SQL deverá ser entregue manualmente ao usuário
- O sistema futuro deve usar tabelas com prefixo `insight_`

## 4. Escopo da primeira entrega funcional
1. Tela de login
2. Sessão autenticada
3. Validação de perfil em `insight_profiles`
4. Leitura de papel em `insight_user_roles`
5. Layout principal do dashboard
6. Página geral
7. Página de estoque integrada
8. Página de vendas integrada
9. Página de financeiro integrada

## 5. Estratégia de execução
1. Formalizar requisitos e arquitetura
2. Inicializar projeto web local
3. Configurar bibliotecas, tema e estrutura de pastas
4. Implementar autenticação local no frontend
5. Gerar SQL do schema `insight_profiles` e `insight_user_roles`
6. Implementar proteção de rotas e login
7. Construir o shell do dashboard
8. Integrar dados de estoque
9. Integrar dados de vendas
10. Integrar dados de financeiro
11. Validar fluxo ponta a ponta
12. Registrar pendências e próximos incrementos

## 6. Regras de autenticação
- O login agora usa Supabase Auth real com persistência de sessão do cliente oficial.
- O acesso exige vínculo em `insight_profiles`.
- O acesso exige papel em `insight_user_roles`.
- Se o perfil do usuário não existir em `insight_profiles`, o frontend tenta criar automaticamente o próprio registro.
- Se o papel não existir em `insight_user_roles`, o login é bloqueado com mensagem explícita.
- O papel previsto segue `admin` ou `user`.
- A interface é multi-cliente e não fica mais orientada apenas à For Men.

## 7. Estrutura prevista
- `.trae/documents/` para PRD e arquitetura técnica
- `src/` para frontend
- `src/pages/` para páginas
- `src/components/` para componentes
- `src/hooks/` para hooks
- `src/utils/` para utilidades
- `supabase/` para artefatos locais relacionados ao projeto Supabase

## 8. Passo a passo detalhado
### Etapa 01 - Documentação
Status: concluída
- Criar PRD
- Criar arquitetura técnica
- Criar este `agent.md`

### Etapa 02 - Fundação do projeto
Status: concluída
- Scaffold do app React + TypeScript
- Instalação de dependências
- Ajuste de tema e estrutura base
- Definição das rotas principais

### Etapa 03 - Supabase e autenticação
Status: concluída
- Implementar cliente Supabase no frontend
- Trocar autenticação local por Supabase Auth
- Persistir sessão real
- Proteger rotas privadas com bootstrap assíncrono
- Validar e resolver perfil em `insight_profiles`
- Validar papel em `insight_user_roles`

### Etapa 04 - Banco de apoio ao auth
Status: concluída
- Criar tipo `insight_app_role`
- Criar tabela `insight_profiles`
- Criar tabela `insight_user_roles`
- Entregar SQL manual para aplicação
- Validar compatibilidade do frontend com o schema futuro

### Etapa 05 - Dashboard e navegação
Status: concluída
- Criar layout com navbar
- Criar página geral
- Criar estados de loading e erro

### Etapa 06 - Integração de estoque
Status: concluída
- Consumir `formen-stock` com JWT real
- Normalizar contrato remoto
- Modelar KPIs
- Criar filtros e listagem responsiva

### Etapa 07 - Integração de vendas
Status: concluída
- Consumir `formen-sales` com JWT real
- Separar vendas e novos clientes
- Criar KPIs e gráficos

### Etapa 08 - Integração de financeiro
Status: concluída
- Consumir `cashtrack-finance` com JWT real
- Agrupar dados por totalizadora e subconta
- Criar KPIs, gráficos e DRE

### Etapa 09 - Validação final
Status: concluída
- Testar login
- Testar navegação autenticada
- Testar carregamento dos módulos
- Revisar erros de build e tipagem

## 9. Log de progresso
### 2026-06-21
- Criado o `agent.md`
- Registrados objetivo, escopo, premissas e trilha de execução
- Documentação formal criada em `.trae/documents`
- Estratégia revisada para funcionamento local sem conexão ativa com Supabase
- Regra adicional registrada: toda criação de schema deve ser acompanhada de SQL manual
- Projeto React inicializado e configurado
- Login local com persistência implementado
- Rotas protegidas e shell principal do dashboard implementados
- Modulos Geral, Financeiro, Vendas e Estoque entregues com dados demonstrativos
- SQL manual criado em `sql/001_insight_auth.sql`
- Validacoes executadas com `npm run check`, `npm run lint`, `npm run test` e `npm run build`
- Solicitação nova registrada: refazer toda a interface em tema exclusivamente light
- Diretriz visual nova registrada: menu ativo com fonte verde principal e borda com mais destaque
- Redesign light aplicado em login, dashboard e módulos internos
- Cabeçalho revisado com menu ativo em verde principal e borda destacada
- Redesign validado novamente com `npm run check`, `npm run lint` e `npm run build`
- Branding atualizado com logo simples no sistema, logo completa no login e favicon configurado
- Posicionamento ajustado para produto multi-cliente da Score, removendo destaque da For Men no acesso
- Fundo da tela de login enriquecido com video em tela cheia e sobreposição translúcida
- Cards do login refinados para branco leitoso translúcido sobre vídeo escuro
- Velocidade do vídeo do login reduzida para reforçar a ambientação visual
- Painéis principais do login ajustados para branco quase sólido, priorizando legibilidade
- Velocidade do vídeo do login reduzida novamente para um movimento ainda mais suave
- Painéis grandes do login ajustados para branco sólido, conforme refinamento de legibilidade solicitado
- Painéis grandes do login reajustados para branco semissólido com transparência leve
- Camada esbranquiçada do vídeo de fundo reforçada para suavizar ainda mais o contraste
- Painéis grandes do login recalibrados com branco translúcido explícito para evitar aparência de vidro puro
- Logo completa do login centralizada no card e ampliada para maior destaque visual
- Projeto Supabase `lunsyufvxkiivnrhpxpj` revalidado como ativo e saudável
- Edge Functions reais mapeadas: `cashtrack-finance`, `formen-sales` e `formen-stock`
- Frontend conectado ao Supabase Auth real com bootstrap de sessão, login e logout reais
- Proteção de rotas ajustada para aguardar validação assíncrona da sessão
- Perfis agora são resolvidos por `insight_profiles` e papéis por `insight_user_roles`
- Dashboard Geral, Financeiro, Vendas e Estoque agora consomem dados remotos reais
- Arquivo SQL adicional criado em `sql/002_seed_insight_access.sql` para vincular usuários já existentes em `auth.users`
- Seção financeira evoluída com nova DRE detalhada em estilo executivo, análise vertical e expansão do segundo nível por subconta
- Seletor global de mês e ano adicionado ao shell do dashboard para aparecer em todas as telas
- Páginas Geral, Financeiro e Vendas ajustadas para reagirem ao período selecionado
- Vendas por dia convertida para gráfico de barras verticais
- Filtro global blindado para aceitar apenas anos entre `2026` e o ano atual, com ajuste automático de meses válidos por ano
- Textos visíveis revisados em PT-BR com acentuação corrigida nas telas, mensagens de autenticação e DRE
- Página de Vendas finalizada com gráfico diário em largura total e blocos de departamentos e vendedores limitados ao top 5
- Gráfico de vendas por dia refinado com rótulos compactos em milhares e tooltip mantendo o valor monetário completo
- Tela de login simplificada com remoção do texto institucional excedente, exclusão da seção de requisitos de acesso e redução da altura visual dos cards principais
- Estrutura multi-tenant fase 1 implementada com vínculo `1 usuário = 1 empresa` em `insight_profiles.empresa_id`
- Auth real expandido para carregar empresa vinculada do usuário e lista de empresas ativas para administradores
- Filtro global evoluído de período para empresa + mês + ano, com seletor de empresa disponível apenas para perfis `admin`
- Páginas Geral, Financeiro, Vendas e Estoque ajustadas para recarregar dados conforme a empresa selecionada
- Edge Functions `cashtrack-finance`, `formen-sales` e `formen-stock` atualizadas para receber `companyId`, validar escopo por papel e aplicar isolamento por empresa
- SQL de apoio criado em `sql/003_gigatech_companies_rls.sql` para leitura segura da tabela `gigatech_clientes_config` no frontend autenticado
- Ajuste de compatibilidade realizado: as Edge Functions originais foram restauradas para não impactar outros sistemas e as versões multi-tenant passaram a usar os slugs `cashtrack-finance_new`, `formen-sales_new` e `formen-stock_new`
- Ajuste adicional no financeiro multi-tenant: o slug válido publicado para a function nova ficou `cashtrack-finance-new`, e o frontend foi alinhado para esse endpoint
- Gestão administrativa adicionada com nova Edge Function `manage-users-new` para listar, criar, editar senha/dados de usuários e simular acesso sem alterar a function legada `manage-users`
- Nova tela `Configurações` criada para administradores com gerenciamento de usuários, definição de papel (`admin` ou `user`), vínculo com cliente e ação de simulação de login
- Cabeçalho refinado: título reduzido para `Painel operacional`, remoção do bloco `Sessão ativa` e inclusão de menu de perfil com edição do nome completo, troca de senha e logout

## 10. Como este arquivo será mantido
- A cada etapa concluída, o status será atualizado neste arquivo.
- O log de progresso receberá um resumo do que foi implementado.
- Se houver mudança relevante de escopo, a estratégia também será revisada aqui.
