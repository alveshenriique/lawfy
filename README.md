# Lawfy — Sistema de Gestão Jurídica

**Acesse o projeto em produção:** [lawfy-beta.vercel.app](https://lawfy-beta.vercel.app)

Plataforma SaaS para gestão de escritórios de advocacia. Centraliza o controle de clientes, processos judiciais e financeiro em uma interface moderna e responsiva.

---

## Funcionalidades

- **Autenticação segura** — cadastro, login e confirmação de e-mail via Supabase Auth
- **Gestão de clientes** — cadastro completo com endereço, busca e filtros em tempo real
- **Gestão de processos** — acompanhamento de ações judiciais com status, partes e vínculo ao cliente
- **Controle financeiro** — lançamentos de receitas e despesas com parcelamento automático, quitação individual de parcelas e controle de vencimentos
- **Dashboard executivo** — visão consolidada com KPIs clicáveis, gráfico de evolução financeira mensal e distribuição de processos por status
- **Perfil do usuário** — atualização de nome e senha
- **Integração Google Calendar** — visualização de eventos da agenda diretamente no dashboard

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
- Validação de entrada com Zod em todas as rotas que recebem dados
- CORS restrito ao domínio do frontend via variável de ambiente

---

## Decisões de Design

**Filtros via URL params** — Os filtros das páginas de listagem são persistidos na URL, permitindo que os cards do dashboard naveguem diretamente para listas pré-filtradas.

**Dois clientes Supabase no backend** — Um cliente administrativo para autenticação e um por requisição com o token do usuário, garantindo que o RLS seja aplicado corretamente em todas as queries.

**Skeleton loaders** — Reduzem a percepção de latência preservando a estrutura visual da página durante o carregamento.

---

## Status do Projeto

Em desenvolvimento ativo. O sistema está sendo utilizado em produção por um escritório de advocacia.
