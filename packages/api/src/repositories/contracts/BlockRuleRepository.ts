import type { BlockRule, PendingRuleChange } from '@block-apps/core'

export type NewBlockRule = Omit<BlockRule, 'id'>

export type Unsubscribe = () => void

export interface BlockRuleRepository {
  list(): Promise<BlockRule[]>
  create(rule: NewBlockRule): Promise<BlockRule>
  applyDueChanges(): Promise<void>
  requestRemoval(ruleId: string): Promise<PendingRuleChange>
  listPendingChanges(): Promise<PendingRuleChange[]>
  cancelPendingChange(changeId: string): Promise<void>
  subscribe(onChange: () => void): Unsubscribe
}
