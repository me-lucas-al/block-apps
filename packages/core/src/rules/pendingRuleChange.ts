import type { BlockMode, TimeWindow } from './blockRule'

export type PendingChangeKind = 'update' | 'delete'

export type PendingRuleChange = {
  readonly id: string
  readonly ruleId: string
  readonly kind: PendingChangeKind
  readonly mode: BlockMode | null
  readonly windows: readonly TimeWindow[] | null
  readonly effectiveAt: string
}
