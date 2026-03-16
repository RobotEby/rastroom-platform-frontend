# Rastroom — Guia de Desenvolvimento

Este documento define **como o projeto funciona** no dia a dia: convenção de commits, branches, testes, qualidade de código e quando pedir ajuda. Todos os contribuidores devem seguir este guia.

---

## 1. Conventional Commits (inglês internacional)

Todas as mensagens de commit devem seguir [Conventional Commits](https://www.conventionalcommits.org/) e serem escritas **em inglês internacional** (não em português).

### Formato

```
tipo(escopo): descrição curta no imperativo

Corpo opcional com detalhes ou breaking changes.
```

### Tipos

| Tipo | Uso | Exemplo |
|------|-----|---------|
| **feat** | Nova funcionalidade | `feat(scanner): add camera-based QR scan` |
| **fix** | Correção de bug | `fix(auth): redirect to login after logout` |
| **chore** | Build, deps, config, tooling | `chore(deps): upgrade react-query to 5.90` |
| **refactor** | Refatoração sem mudar comportamento | `refactor(pages): extract orders table to widget` |
| **docs** | Apenas documentação | `docs: add FSD architecture section to README` |
| **test** | Testes | `test(entities): add AuthContext unit tests` |
| **style** | Formatação (Prettier, etc.) | `style(shared): run Prettier on ui/` |
| **perf** | Melhoria de performance | `perf(build): add Vite manualChunks for vendor` |

### Escopo

Use o escopo que descreve a **camada ou módulo** afetado (FSD no frontend, camada no backend):

- Frontend: `app`, `pages`, `widgets`, `features`, `entities`, `shared`, ou nome da página/feature (ex.: `scanner`, `orders`).
- Backend: `domain`, `application`, `infra`, `presentation`, ou domínio (ex.: `auth`, `orders`).
- Raiz: `build`, `deps`, `ci`, ou omitir escopo quando for global.

### Exemplos corretos

```text
feat(widgets): add global header component
fix(pages): fix orders filter by status
chore(build): remove build:dev script for Vercel
refactor(entities): move Order types to entities/order
docs: add development guide and commit conventions
test(shared): add useToast tests
perf(build): add code-splitting for React and Radix
```

### Exemplos incorretos

```text
Adicionei o botão          # Não convencional, em português
feat: novo componente       # Português; preferir "add X component"
fix bug                    # Sem escopo; "fix(scope): describe the fix"
```

---

## 2. Estratégia de branches

### Branches principais

| Branch | Uso |
|--------|-----|
| **main** | Código em produção. Só recebe merge de `develop` ou, em emergência, de `hotfix/*`. |
| **develop** | Integração contínua. Features e correções são mergeados aqui antes de ir para `main`. |

### Branches de trabalho

Crie sempre a branch a partir de **develop** (ou de **main** se ainda não existir `develop`):

| Prefixo | Exemplo | Uso |
|---------|---------|-----|
| **feature/** | `feature/scanner-offline` | Nova funcionalidade |
| **bugfix/** | `bugfix/login-redirect` | Correção de bug em desenvolvimento |
| **hotfix/** | `hotfix/security-patch` | Correção urgente a partir de `main` |
| **refactor/** | `refactor/orders-api` | Refatoração sem mudança de comportamento |
| **docs/** | `docs/development-guide` | Apenas documentação |
| **chore/** | `chore/upgrade-vite` | Config, deps, tooling |

### Fluxo resumido

1. Atualize `develop`: `git fetch origin && git checkout develop && git pull --rebase origin develop`
2. Crie sua branch: `git checkout -b feature/nome-da-feature`
3. Faça commits seguindo Conventional Commits em inglês
4. Atualize de novo antes de abrir PR: `git pull --rebase origin develop`
5. Abra Pull Request de `feature/...` (ou `bugfix/...`) para **develop**
6. Após revisão e aprovação, merge em `develop`; deploy para produção via merge de `develop` em `main` (ou conforme pipeline do time)

---

## 3. Testes

### Executar testes

```bash
npm test           # roda uma vez
npm run test:watch # modo watch durante desenvolvimento
```

### Quando adicionar testes

- **Novas features:** inclua testes que cubram o comportamento principal (unit ou integração, conforme o caso).
- **Correção de bug:** sempre que possível, adicione ou ajuste um teste que reproduza o bug e garanta que a correção persista.
- **Refatoração:** mantenha ou melhore a cobertura existente; testes devem continuar passando.

### Onde colocar testes

- Frontend: ao lado do módulo (ex.: `entities/user/__tests__/AuthContext.test.tsx`) ou em pasta `__tests__` dentro do slice.
- Backend: em `core/backend-java/` (testes Maven/JUnit) ou junto ao módulo testado, conforme convenção do time.

### CI

O build e os testes devem passar no pipeline (ex.: GitHub Actions, Vercel). Não faça merge com testes quebrados ou lint falhando.

---

## 4. Qualidade de código: sem legado, código limpo

### Princípios

- **Código novo não é legado:** tudo que for escrito deve seguir as regras atuais do projeto (FSD no frontend, camadas no backend, TypeScript estrito).
- **Nada de "depois a gente arruma":** evite comentários do tipo `// TODO` ou código provisório sem issue associada; se for inevitável, abra uma issue e referencie no comentário.
- **TypeScript estrito:** sem `any`; tipar retornos e parâmetros; usar tipos do domínio (entities) em vez de tipos soltos.
- **Respeitar a arquitetura:** FSD no frontend (dependências entre camadas); no backend, domain → application → presentation → infra. Não pular camadas nem misturar responsabilidades.
- **Nomenclatura clara:** nomes em inglês para código (variáveis, funções, arquivos); comentários e documentação podem ser em português se for o combinado do time.

### Antes de commitar

1. **Lint:** `npm run lint` sem erros.
2. **Testes:** `npm test` passando.
3. **Build:** `npm run build` concluindo (recomendado, principalmente antes de abrir PR).

---

## 5. Quando pedir ajuda

Pedir ajuda é parte do fluxo. Use quando:

- **Dúvida de arquitetura:** não souber em qual camada/slice colocar um código (ex.: "isso é feature ou entity?").
- **Decisão que impacta o time:** mudança de lib, padrão de API, convenção de pastas.
- **Refatoração grande:** antes de refatorar um módulo crítico, alinhe com o time ou abra uma issue descrevendo o plano.
- **Bug difícil de reproduzir:** descreva passos, ambiente e, se possível, gravação ou log; facilita para quem for ajudar.
- **Review antes de PR grande:** se o PR tiver muitas mudanças, vale pedir uma leitura antecipada ou dividir em PRs menores.

### Onde pedir ajuda

- **Issues do repositório:** dúvidas, propostas e discussões técnicas.
- **Pull Request:** use a descrição e os comentários para explicar o "porquê" e pedir revisão focada.
- **Canal/sistema do time:** conforme definido pelo projeto (Slack, Discord, etc.).

---

## 6. Resumo rápido

| Assunto | Regra |
|---------|--------|
| **Commits** | Conventional Commits, **em inglês** (ex.: `feat(scanner): add camera scan`). |
| **Branches** | `develop` para integração; trabalho em `feature/*`, `bugfix/*`, etc. |
| **PR** | Sempre para `develop`; branch atualizada, lint e testes ok. |
| **Testes** | Rodar antes de commitar; adicionar em features e bugfixes. |
| **Código** | Sem legado novo; TypeScript estrito; respeitar FSD e camadas. |
| **Ajuda** | Pedir em dúvidas de arquitetura, decisões de time e refatorações grandes. |

Para **arquitetura FSD**, **stack** e **setup local**, use o [README](README.md) do repositório.
