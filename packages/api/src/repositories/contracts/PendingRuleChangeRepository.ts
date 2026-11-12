import type { PendingRuleChange } from '@block-apps/core'

export interface PendingRuleChangeRepository {
  applyDueChanges(): Promise<void>
  requestRemoval(ruleId: string): Promise<PendingRuleChange>
  listPendingChanges(): Promise<PendingRuleChange[]>
  cancelPendingChange(changeId: string): Promise<void>
}
