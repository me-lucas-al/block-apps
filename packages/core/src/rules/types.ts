export type TargetType = 'app' | 'site'

export type BlockMode = 'always' | 'schedule'

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type TimeWindow = {
  readonly days: readonly DayOfWeek[]
  readonly start: string
  readonly end: string
}

export type PendingChangeKind = 'update' | 'delete'

export type PendingRuleChange = {
  readonly id: string
  readonly ruleId: string
  readonly kind: PendingChangeKind
  readonly mode: BlockMode | null
  readonly windows: readonly TimeWindow[] | null
  readonly effectiveAt: string
}

export type BlockRule = {
  readonly id: string
  readonly targetType: TargetType
  readonly target: string
  readonly mode: BlockMode
  readonly windows: readonly TimeWindow[]
}
