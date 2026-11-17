import type { BlockRule, PendingRuleChange } from '@block-apps/core'

export interface BlockerPort {
  applyRules(rules: readonly BlockRule[], pendingChanges: readonly PendingRuleChange[]): void
  refreshEnforcement(): void
}
