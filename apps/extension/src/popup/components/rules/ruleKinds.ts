import type { TargetType } from '@block-apps/core'

export type RuleKind = Extract<TargetType, 'site' | 'keyword'>

export const RULE_KINDS: readonly RuleKind[] = ['site', 'keyword']

type RuleKindLabels = {
  readonly tab: string
  readonly placeholder: string
  readonly submit: string
  readonly empty: string
}

export const RULE_KIND_LABELS: Record<RuleKind, RuleKindLabels> = {
  site: {
    tab: 'Sites',
    placeholder: 'Site, ex.: youtube.com',
    submit: 'Bloquear site',
    empty: 'Nenhum site bloqueado ainda.',
  },
  keyword: {
    tab: 'Palavras de busca',
    placeholder: 'Palavra ou frase, ex.: apostas',
    submit: 'Bloquear palavra',
    empty: 'Nenhuma palavra proibida ainda.',
  },
}
