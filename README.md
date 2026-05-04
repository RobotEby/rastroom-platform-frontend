# Rastroom Platform

<p align="center">
  <strong>Sistema web/PWA para rastreabilidade de peças de móveis com QR Code, controle de produção, montagem e expedição.</strong>
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-em%20desenvolvimento-f59e0b?style=for-the-badge">
  <img alt="React" src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=111827">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5.4.21-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-3.4.19-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white">
  <img alt="PWA" src="https://img.shields.io/badge/PWA-ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white">
</p>

<p align="center">
  <img alt="React Router" src="https://img.shields.io/badge/React%20Router-6.30.1-CA4245?style=flat-square&logo=reactrouter&logoColor=white">
  <img alt="TanStack Query" src="https://img.shields.io/badge/TanStack%20Query-5.90.21-FF4154?style=flat-square&logo=reactquery&logoColor=white">
  <img alt="Radix UI" src="https://img.shields.io/badge/Radix%20UI-components-111827?style=flat-square">
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-3.2.4-6E9F18?style=flat-square&logo=vitest&logoColor=white">
  <img alt="ESLint" src="https://img.shields.io/badge/ESLint-9.32.0-4B32C3?style=flat-square&logo=eslint&logoColor=white">
</p>

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Status do projeto](#status-do-projeto)
- [Principais funcionalidades](#principais-funcionalidades)
- [Perfis de acesso](#perfis-de-acesso)
- [Arquitetura e stack](#arquitetura-e-stack)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Scripts disponíveis](#scripts-disponíveis)
- [Rotas da aplicação](#rotas-da-aplicação)
- [Integração com a API](#integração-com-a-api)
- [Importação de peças](#importação-de-peças)
- [PWA e instalação](#pwa-e-instalação)
- [Testes e qualidade](#testes-e-qualidade)
- [Build e deploy](#build-e-deploy)
- [Troubleshooting](#troubleshooting)
- [Roadmap sugerido](#roadmap-sugerido)
- [Contribuição](#contribuição)
- [Licença](#licença)
- [Autor e contato](#autor-e-contato)

## Sobre o projeto

O **Rastroom Platform** é uma aplicação frontend para controle e rastreabilidade de peças na produção de móveis. A plataforma conecta o cadastro comercial e técnico, como clientes, pedidos, móveis e peças, ao fluxo operacional do chão de fábrica, com leitura de QR Code, avanço por processos, validação de kits e expedição.

O objetivo é reduzir perdas de informação entre engenharia, produção, montagem e entrega, oferecendo uma visão clara de onde cada peça está, qual etapa precisa ser executada e quais pedidos já podem seguir para montagem ou expedição.

> Este repositório contém o **frontend** da plataforma. A API é esperada como um backend Node.js/TypeScript rodando em ambiente separado.

## Status do projeto

🟡 **Em desenvolvimento.**

O frontend já possui os principais módulos da operação implementados, incluindo autenticação, dashboards, cadastros, scanner, processos, montagem, expedição e PWA. Ainda há pontos de evolução recomendados, especialmente em testes automatizados, contrato formal da API e ajustes finais de deploy.

## Principais funcionalidades

- 🔐 **Autenticação com sessão JWT**: login, cadastro, restauração de sessão e logout.
- 👥 **Controle por perfil de usuário**: menus e áreas da aplicação variam por papel operacional.
- 📊 **Dashboard administrativo**: indicadores de pedidos, peças, clientes e peças pendentes.
- 🧾 **Gestão de clientes**: criação, edição, listagem e remoção de clientes.
- 📦 **Gestão de pedidos**: cadastro por cliente, status do pedido e data estimada de entrega.
- 🪑 **Gestão de móveis**: vínculo entre pedidos e móveis, tipo e lead time estimado.
- 🧩 **Gestão de peças**: cadastro manual de peças, medidas, material, acabamento, cor, receita de tinta e processos.
- 🔳 **QR Code por peça**: geração e visualização de QR Codes com `qrcode.react`.
- 📷 **Scanner de peças**: leitura por câmera usando `html5-qrcode` ou entrada manual/scanner USB.
- 📥 **Importação CSV/XML**: importação em lote de peças com preview antes do envio.
- 🏭 **Fluxo de processos**: controle de etapas como corte, lixamento, pintura, borda, montagem e expedição.
- ⏱️ **Cronometragem de execução**: início/fim de processo com tempo decorrido.
- 🚦 **Validação de sequência**: bloqueio de uma etapa quando a anterior ainda não foi concluída.
- ✅ **Conferência de kit**: validação de peça-mãe e peças filhas antes da montagem.
- 🚚 **Expedição**: listagem de pedidos prontos e marcação como expedidos.
- 📈 **Dashboard de supervisor**: gráficos, tempos médios, atividades recentes e alertas de gargalo.
- 📱 **PWA instalável**: suporte a instalação em celular e cache básico via `vite-plugin-pwa`.

## Perfis de acesso

A aplicação usa papéis retornados pela API para montar a navegação:

| Perfil                  | Acesso principal                                                      |
| ----------------------- | --------------------------------------------------------------------- |
| `admin`                 | Painel, clientes, pedidos, móveis, peças e também áreas operacionais. |
| `operator` / `operador` | Scanner e processos do chão de fábrica.                               |
| `montagem`              | Montagem/conferência de kit e expedição.                              |
| `supervisor`            | Dashboard de supervisor e tela de instalação do app.                  |

Caso nenhum desses papéis seja identificado, o frontend exibe todos os grupos de menu como fallback operacional.

## Arquitetura e stack

### Frontend

- **React 18** com **TypeScript**.
- **Vite** como bundler/dev server.
- **React Router DOM** para rotas e layout protegido.
- **TanStack React Query** para cache, sincronização e invalidação de dados da API.
- **Tailwind CSS** para estilização utilitária.
- **Radix UI/shadcn-style components** para componentes acessíveis e reutilizáveis.
- **Lucide React** para ícones.
- **Recharts** para gráficos do dashboard.
- **Sonner** e toast local para feedback visual.
- **html5-qrcode** para leitura de QR Code pela câmera.
- **qrcode.react** para renderização de QR Code.
- **vite-plugin-pwa** para manifesto, service worker e instalação do app.

### Backend

- **API Node.js/TypeScript** esperada em `http://localhost:8081` durante o desenvolvimento.
- O frontend conversa com a API por `fetch`, usando `VITE_API_URL` ou o proxy `/api` configurado no Vite.
- Este repositório não contém o código do backend, migrations, seeds ou schema de banco.

### Banco de dados

- O banco é responsabilidade do backend.
- Pelo desenho da aplicação, a API deve persistir entidades como usuários, clientes, pedidos, móveis, peças, processos, logs de execução, kits e expedições.

### Qualidade e ferramentas

- **ESLint 9** com regras para TypeScript, React Hooks e React Refresh.
- **Vitest 3** com ambiente `jsdom`.
- **Testing Library** já disponível como dependência de teste.
- **PostCSS** e **Autoprefixer** no pipeline de CSS.

## Estrutura de pastas

```text
.
├── core/frontend/src
│   ├── app
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── router
│   │   └── styles
│   ├── entities
│   │   ├── order
│   │   └── user
│   ├── features
│   │   └── import-parts
│   ├── pages
│   │   ├── assembly
│   │   ├── clients
│   │   ├── dashboard
│   │   ├── expedition
│   │   ├── furniture
│   │   ├── install
│   │   ├── orders
│   │   ├── parts
│   │   ├── processes
│   │   └── scanner
│   ├── shared
│   │   ├── api
│   │   ├── hooks
│   │   ├── lib
│   │   └── ui
│   └── widgets
│       ├── app-layout
│       ├── app-sidebar
│       └── auth-form
├── .env.example
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── vitest.config.ts
```

### Organização conceitual

- `app`: bootstrap da aplicação, providers globais, rotas e estilos.
- `entities`: modelos/contextos ligados a entidades de domínio.
- `features`: funcionalidades autocontidas que podem aparecer dentro de páginas.
- `pages`: telas roteadas da aplicação.
- `shared`: infraestrutura reutilizável, API client, hooks, utilitários e UI base.
- `widgets`: blocos maiores de interface, como layout, sidebar e formulário de autenticação.

## Pré-requisitos

Antes de começar, instale:

- **Node.js 18+**.
- **npm** compatível com o projeto.
- **Backend Rastroom** rodando localmente, preferencialmente em `http://localhost:8081`.
- Navegador moderno com suporte a câmera caso use o scanner por câmera.

Para recursos de câmera/PWA em dispositivos reais, prefira servir a aplicação em `https` em ambientes fora do localhost.

## Variáveis de ambiente

O projeto possui um arquivo de exemplo:

```bash
.env.example
```

Variável disponível:

| Variável       | Obrigatória | Descrição                | Exemplo                 |
| -------------- | ----------- | ------------------------ | ----------------------- |
| `VITE_API_URL` | Sim         | URL base da API backend. | `http://localhost:8081` |

Crie seu arquivo local:

```bash
cp .env.example .env
```

Exemplo de `.env`:

```env
VITE_API_URL=http://localhost:8081
```

> Não versione `.env` com valores reais. O `.gitignore` já ignora `.env` e `.env.local`.

## Como rodar o projeto

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd rastroom-platform-frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

```bash
cp .env.example .env
```

Edite `VITE_API_URL` se a API estiver em outra porta ou domínio.

### 4. Suba o backend

Garanta que a API esteja disponível. Em desenvolvimento, o frontend está preparado para conversar com:

```text
http://localhost:8081
```

### 5. Inicie o frontend

```bash
npm run dev
```

Por padrão, o Vite usa:

```text
http://localhost:8080
```

## Scripts disponíveis

| Comando              | Descrição                                  |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Inicia o servidor de desenvolvimento Vite. |
| `npm run build`      | Gera a build de produção em `dist/`.       |
| `npm run preview`    | Serve localmente a build de produção.      |
| `npm run lint`       | Executa ESLint no projeto.                 |
| `npm run test`       | Executa a suíte de testes com Vitest.      |
| `npm run test:watch` | Executa Vitest em modo observação.         |

## Rotas da aplicação

| Rota         | Tela                    | Protegida | Descrição                                   |
| ------------ | ----------------------- | --------- | ------------------------------------------- |
| `/login`     | Login/Cadastro          | Não       | Autenticação do usuário.                    |
| `/`          | Painel de Controle      | Sim       | Indicadores gerais de produção.             |
| `/clientes`  | Clientes                | Sim       | CRUD de clientes.                           |
| `/pedidos`   | Pedidos                 | Sim       | CRUD de pedidos e status.                   |
| `/moveis`    | Móveis                  | Sim       | Cadastro de móveis por pedido.              |
| `/pecas`     | Peças                   | Sim       | Cadastro, importação e QR Code de peças.    |
| `/scanner`   | Scanner                 | Sim       | Leitura por câmera, teclado ou scanner USB. |
| `/processos` | Processos               | Sim       | Execução e conclusão de etapas de produção. |
| `/montagem`  | Montagem / Kit          | Sim       | Conferência de peça-mãe e peças filhas.     |
| `/expedicao` | Expedição               | Sim       | Pedidos prontos para entrega.               |
| `/dashboard` | Dashboard do Supervisor | Sim       | Métricas, gargalos e atividades recentes.   |
| `/instalar`  | Instalar App            | Sim       | Instruções e gatilho de instalação PWA.     |
| `*`          | Not Found               | Não       | Página de rota não encontrada.              |

## Integração com a API

O client central fica em:

```text
core/frontend/src/shared/api/client.ts
```

Ele é responsável por:

- Ler `VITE_API_URL`.
- Remover barra final da URL base.
- Adicionar `Content-Type: application/json` quando apropriado.
- Enviar `Authorization: Bearer <token>` quando houver token salvo.
- Normalizar erros em `ApiError`.
- Salvar/remover tokens no `localStorage`.

### Chaves de sessão no navegador

```text
rastroom.access_token
rastroom.refresh_token
```

### Endpoints esperados

| Contexto     | Endpoints usados                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| Autenticação | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/logout`                                       |
| Dashboard    | `/dashboard/orders-count`, `/dashboard/parts-count`, `/dashboard/clients-count`, `/dashboard/pending-parts`          |
| Supervisor   | `/dashboard/parts-by-process`, `/dashboard/recent-logs`, `/dashboard/avg-times`, `/dashboard/alerts`                 |
| Clientes     | `GET /clients`, `POST /clients`, `PATCH /clients/:id`, `DELETE /clients/:id`                                         |
| Pedidos      | `GET /orders`, `POST /orders`, `PATCH /orders/:id`, `DELETE /orders/:id`                                             |
| Móveis       | `GET /furniture`, `POST /furniture`, `DELETE /furniture/:id`                                                         |
| Peças        | `GET /parts`, `POST /parts`, `GET /parts/:id`, `DELETE /parts/:id`, `GET /parts/by-code/:code`, `POST /parts/import` |
| Processos    | `GET /processes/part/:partId`, `POST /processes/:processId/start`, `POST /processes/logs/:logId/finish`              |
| Montagem     | `GET /assembly/kits/lookup?code=:code`, `POST /assembly/kits/:motherPartId/finalize`                                 |
| Expedição    | `GET /expedition/orders`, `POST /expedition/orders/:orderId/expedite`                                                |

## Importação de peças

A tela de peças permite importar arquivos `.csv` ou `.xml` e enviar as peças em lote para a API.

### CSV esperado

```csv
nome, codigo, largura_mm, altura_mm, profundidade_mm, material, cor, cor_hex, tipo_acabamento, receita_tinta, borda, peca_mae
Lateral Esquerda, LAT-001, 700, 500, 18, MDF 18mm, Branco Neve, #ffffff, Laca, Base X + Corante Y, Fita branca, sim
```

Observações:

- O parser aceita separador por vírgula ou ponto e vírgula.
- Se `codigo` vier vazio, o frontend gera um código temporário.
- `peca_mae` deve ser `sim` para marcar a peça como peça-mãe.
- Após o preview, o envio é feito para `POST /parts/import`.

### XML esperado

O parser procura nós como:

```xml
<part>
  <name>Lateral Esquerda</name>
  <code>LAT-001</code>
  <width>700</width>
  <height>500</height>
  <depth>18</depth>
  <material>MDF 18mm</material>
  <color>Branco Neve</color>
  <color_hex>#ffffff</color_hex>
  <finish_type>Laca</finish_type>
  <paint_recipe>Base X + Corante Y</paint_recipe>
  <edge_banding>Fita branca</edge_banding>
  <mother>sim</mother>
</part>
```

Também há suporte a alguns nomes em português, como `peca`, `nome`, `codigo`, `largura`, `altura`, `profundidade`, `cor`, `tipo_acabamento`, `receita_tinta`, `borda` e `peca_mae`.

## PWA e instalação

O projeto usa `vite-plugin-pwa` com:

- `registerType: "autoUpdate"`.
- Manifesto com nome **Rastroom**.
- Modo `standalone`.
- Orientação `portrait`.
- Cache runtime com estratégia `NetworkFirst` para chamadas de API compatíveis.
- Tela `/instalar` com fluxo de instalação em Android/Chrome e instruções para iPhone/Safari.

Arquivos de ícone existentes:

```text
core/frontend/src/shared/assets/img/pwa-192x192.png
core/frontend/src/shared/assets/img/pwa-512x512.png
```

> Atenção: o manifesto referencia `/pwa-192x192.png` e `/pwa-512x512.png`. Para produção, confirme se esses arquivos estarão disponíveis na pasta pública/raiz servida pelo Vite.

## Testes e qualidade

### Rodar lint

```bash
npm run lint
```

### Rodar testes

```bash
npm run test
```

### Rodar testes em modo watch

```bash
npm run test:watch
```

Configuração atual do Vitest:

- Ambiente: `jsdom`.
- Setup: `./src/test/setup.ts`.
- Padrão de arquivos: `src/**/*.{test,spec}.{ts,tsx}`.

> Observação: a configuração de testes aponta para `src/`, enquanto o código da aplicação está em `core/frontend/src`. Caso os testes sejam adicionados dentro de `core/frontend/src`, ajuste `vitest.config.ts` para incluir esse caminho.

## Build e deploy

Gere a build:

```bash
npm run build
```

Visualize a build localmente:

```bash
npm run preview
```

Checklist antes de publicar:

- Definir `VITE_API_URL` para a URL pública da API.
- Garantir que o backend aceite CORS do domínio do frontend.
- Confirmar disponibilidade dos ícones PWA na raiz pública.
- Validar login e restauração de sessão em produção.
- Testar scanner por câmera em contexto seguro (`https`).
- Rodar `npm run lint` e `npm run build`.

## Troubleshooting

### A tela fica em login mesmo após autenticar

- Verifique se `/auth/login` retorna `access_token`, `refresh_token`, `user` e `roles`.
- Verifique se `/auth/me` aceita o token no header `Authorization`.
- Confira se `VITE_API_URL` aponta para a API correta.

### Erro de CORS

- Configure o backend para aceitar a origem do frontend.
- Em desenvolvimento, confirme se o backend está em `http://localhost:8081`.

### Scanner por câmera não abre

- Use `localhost` ou `https`.
- Dê permissão de câmera no navegador.
- Em celular, prefira a câmera traseira.

### QR Code não encontra peça

- Confira se o conteúdo do QR possui `code` válido ou se o texto escaneado é o próprio código.
- Verifique o endpoint `GET /parts/by-code/:code`.

### PWA não instala

- A instalação depende de navegador compatível e critérios de PWA.
- Confira manifesto, service worker, ícones e uso de `https` em produção.

## Roadmap sugerido

- [ ] Adicionar testes para autenticação, rotas protegidas e API client.
- [ ] Padronizar tipagens de domínio compartilhadas entre páginas.
- [ ] Criar camada de services por recurso (`clients`, `orders`, `parts`, etc.).
- [ ] Adicionar paginação/filtros em tabelas com muitos registros.
- [ ] Melhorar tratamento de erros de JSON inválido no API client.
- [ ] Confirmar estratégia final dos ícones PWA em `public/`.
- [ ] Documentar contrato oficial da API backend com OpenAPI/Swagger.

## Contribuição

1. Crie uma branch a partir da principal:

```bash
git checkout -b release/vNota de Versão ex.: release/v0.1.0, release/v1.0.0, hotfix, docs, fix.
```

2. Instale dependências e rode o projeto:

```bash
npm install
npm run dev
```

3. Antes de abrir PR, valide:

```bash
npm run lint
npm run build
```

4. Abra um Pull Request descrevendo:

- O problema resolvido.
- O que foi alterado.
- Como testar.
- Prints ou gravações quando houver mudança visual.

## Licença

Este repositório ainda não possui um arquivo de licença publicado.

## Autor e contato

- **Nome:** [@Kerlon Amaral](github.com/RobotEby)
- **LinkedIn:** [kerlon-amaral-dev](https://www.linkedin.com/in/kerlon-amaral-dev/)
- **GitHub:** [RobotEby](github.com/RobotEby)

---

<p align="center">
  Feito para dar visibilidade ao chão de fábrica, da primeira peça ao pedido expedido.
</p>
