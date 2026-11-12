import type { PendingRuleChange } from '@block-apps/core'

export interface DueChangeApplier {
  applyDueChange(userId: string, change: PendingRuleChange): Promise<boolean>
}
