<p align="center">
  <img src="frontend/public/logo.svg" alt="Lawfy" height="80">
</p>

<h1 align="center">Lawfy — Sistema de Gestão Jurídica</h1>

<p align="center">
  <strong>Acesse o projeto em produção:</strong> <a href="https://lawfy-beta.vercel.app">lawfy-beta.vercel.app</a>
</p>

Plataforma SaaS desenvolvida para escritórios de advocacia. Centraliza o controle de clientes, processos judiciais e financeiro em uma interface moderna, segura e responsiva.

---

## Visão Geral

O Lawfy resolve um problema recorrente em escritórios de advocacia: a gestão fragmentada de informações entre planilhas, cadernos e sistemas desconexos. A plataforma unifica em um único ambiente o acompanhamento de clientes, o ciclo de vida dos processos e o controle financeiro completo — com dados isolados por usuário e acesso exclusivo via autenticação.

---

## Funcionalidades

- **Autenticação** — Cadastro, login com confirmação de e-mail e gerenciamento de sessão via JWT
- **Gestão de clientes** — Cadastro completo com endereço, busca textual, filtros e ordenação em tempo real
- **Gestão de processos** — Acompanhamento de ações judiciais com número, partes, tipo, status e vínculo ao cliente
- **Controle financeiro** — Lançamentos de receitas e despesas com parcelamento automático, quitação individual de parcelas, rastreamento de vencimentos e visualização de múltiplas parcelas simultaneamente
- **Compartilhamento de clientes** — Compartilhamento de clientes entre advogadas do escritório com controle de acesso por proprietário
- **Exportação de dados** — Exportação de clientes, processos e financeiro em CSV e PDF com respeito aos filtros e ordenação ativos
- **Ordenação de tabelas** — Ordenação por múltiplas colunas em todas as listagens, refletida nas exportações
- **Dashboard executivo** — KPIs clicáveis com navegação direta para listas filtradas, gráfico de evolução financeira mensal e distribuição de processos por status
- **Interface responsiva** — Layout adaptado para dispositivos móveis com navegação inferior dedicada
- **Perfil do usuário** — Atualização de nome e senha
- **Google Calendar** — Visualização de eventos da agenda do advogado diretamente no dashboard

---

## Stack Tecnológica

### Frontend
| Tecnologia | Uso |
|---|---|
| React 19 + TypeScript | Interface de usuário com tipagem estática |
| Vite 8 | Build tool e dev server |
| Tailwind CSS 4 | Estilização utilitária com design system customizado |
| React Router 7 | Roteamento client-side com filtros via URL params |
| React Hook Form + Zod | Formulários com validação declarativa |
| Recharts | Gráficos interativos (área e donut chart) |
| Axios | Cliente HTTP com interceptors para auth e erros globais |

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js + Express + TypeScript | API REST |
| Supabase JS SDK | Autenticação e acesso ao banco com suporte a RLS |
| Zod | Validação de entrada em todas as rotas |

### Infraestrutura
| Serviço | Uso |
|---|---|
| Supabase | Banco PostgreSQL gerenciado, Auth e Row Level Security |
| Vercel | Hospedagem do frontend |
| Railway | Hospedagem do backend |

---

## Arquitetura

```
lawfy/
├── backend/
│   └── src/
│       ├── config/       # Clientes Supabase (admin e por usuário)
│       ├── controllers/  # Lógica de negócio por recurso
│       ├── middlewares/  # Autenticação JWT, validação Zod e erros centralizados
│       ├── routes/       # Definição dos endpoints
│       └── schemas/      # Contratos de entrada com Zod
│
└── frontend/
    └── src/
        ├── components/   # Componentes reutilizáveis (UI + layout)
        ├── hooks/        # Custom hooks com estado e chamadas à API por recurso
        ├── lib/          # Schemas de validação dos formulários
        ├── pages/        # Páginas da aplicação
        ├── services/     # Camada de abstração das chamadas HTTP
        └── types/        # Interfaces e tipos TypeScript
```

---

## Segurança

- Todas as rotas da API exigem JWT válido no header `Authorization: Bearer`
- O token é validado no Supabase a cada requisição — sem estado local no servidor
- **Row Level Security (RLS)** habilitado no banco: cada usuário acessa exclusivamente os próprios dados, independentemente da lógica da aplicação
- Erros são tratados de forma centralizada sem expor stack traces ao cliente
- Validação de entrada com Zod em todas as rotas que recebem dados
- CORS restrito ao domínio do frontend via variável de ambiente

---

## Decisões de Design

**Filtros via URL params** — Os filtros das páginas de listagem são persistidos na URL, o que permite que os cards clicáveis do dashboard naveguem diretamente para listas pré-filtradas sem estado compartilhado entre componentes.

**Dois clientes Supabase no backend** — Um cliente administrativo para autenticação e um cliente criado por requisição com o token do usuário para operações de banco. Isso garante que o RLS seja aplicado corretamente em todas as queries.

**Skeleton loaders ao invés de spinners** — Reduz a percepção de latência ao preservar a estrutura visual da página durante o carregamento.

---

## Status do Projeto

Em desenvolvimento ativo. O sistema está sendo utilizado em ambiente de produção por um escritório de advocacia.
