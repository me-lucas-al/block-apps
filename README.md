# Block Apps

Bloqueador de apps e sites. Cada item bloqueado tem uma regra:

- **Sempre bloqueado**, ou
- **Permitido só em horários** (por dia da semana e faixa de hora; aceita faixa que cruza a meia-noite).

As regras ficam na conta do usuário (Supabase). Reinstalar o app ou a extensão e entrar de novo restaura tudo.

## Status

| Parte | Estado |
| --- | --- |
| `packages/core` (regras e horários) | pronto |
| `supabase/` (schema, RLS, realtime) | pronto, RLS ainda não testada em projeto real |
| `packages/api` (repositórios) | pronto |
| `apps/extension` (Chrome/Edge) | pronto, falta teste manual no navegador |
| Extensão Firefox | planejado |
| App Android (React Native + Kotlin) | planejado |
| App iOS (React Native + Screen Time API) | planejado |
| Cooldown anti-burla para alterar regras | planejado |

## Como funciona

- **Extensão**: usa `declarativeNetRequest` para redirecionar o site bloqueado para uma página de bloqueio. Um alarme a cada minuto reavalia os horários; outro a cada 5 minutos sincroniza com o servidor. As regras ficam em cache local, então o bloqueio funciona offline.
- **Sair da conta não desbloqueia.** O cache local permanece e nunca é sobrescrito por uma lista vazia quando não há sessão.
- **Android** (planejado): `AccessibilityService` detecta o app em primeiro plano e abre uma tela de bloqueio. `Device Admin` dificulta a desinstalação.
- **iOS** (planejado): Screen Time API (`FamilyControls`, `ManagedSettings`, `DeviceActivity`).

## Limites conhecidos

- **Aba anônima**: o navegador exige que o usuário ative "Permitir no modo anônimo" na extensão. Ela não consegue ativar sozinha; apenas detecta, avisa no popup e reporta o status ao servidor.
- **iOS**: a Apple não permite que um app impeça a própria desinstalação. Reinstalar e entrar restaura as regras. Exige conta Apple Developer paga e o entitlement `com.apple.developer.family-controls`.
- **Android**: `Device Admin` torna a desinstalação mais difícil, mas um usuário determinado ainda consegue (modo seguro, ADB). Modo Device Owner (MDM) está fora do escopo.
- Bloquear sites dentro de qualquer navegador no celular exigiria VPN/DNS local; não faz parte da v1.

## Estrutura

```
block-apps/
  packages/
    core/          modelo BlockRule, isBlockedNow, normalizeSiteTarget (TS puro)
    api/           interfaces de repositório + implementação Supabase
  apps/
    extension/     Vite + React + MV3
  supabase/
    migrations/    schema e RLS
```

Padrões do código: sem comentários, arquivos de até 100 linhas, uma responsabilidade por módulo, dependências por interface (portas e adaptadores), testes ao lado do código em `tests/`.

## Começando

Requisitos: Node 20+ e pnpm.

```bash
pnpm install
pnpm test
pnpm typecheck
```

### Banco (Supabase)

1. Crie um projeto no Supabase.
2. Aplique `supabase/migrations/20261111000000_init.sql` (SQL Editor ou `supabase db push`).
3. Em Authentication, habilite e-mail e senha.

### Extensão

```bash
cd apps/extension
cp .env.example .env
```

Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env` (use apenas a chave `anon`, nunca a `service_role`).

```bash
pnpm build
```

No Chrome ou Edge: abra `chrome://extensions`, ative o modo desenvolvedor, clique em **Carregar sem compactação** e escolha `apps/extension/dist`. Para bloquear também em abas anônimas, ative **Permitir no modo anônimo** nos detalhes da extensão.

Durante o desenvolvimento use `pnpm dev` (rebuild ao salvar) e recarregue a extensão.

## Modelo de regra

```ts
type BlockRule = {
  id: string
  targetType: 'app' | 'site'
  target: string
  mode: 'always' | 'schedule'
  windows: { days: (0 | 1 | 2 | 3 | 4 | 5 | 6)[]; start: 'HH:mm'; end: 'HH:mm' }[]
}
```

Em `schedule`, as janelas são os períodos **permitidos**. Fora delas (ou sem nenhuma janela) o alvo fica bloqueado. `days` usa 0 = domingo.

## Segurança

- O repositório é público. Nunca versione `.env` nem chaves privadas.
- Toda tabela usa RLS: cada usuário só enxerga as próprias linhas.
