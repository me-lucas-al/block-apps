import type { BlockRule, PendingRuleChange } from '@block-apps/core'

export type RulesSnapshot = {
  readonly rules: readonly BlockRule[]
  readonly pendingChanges: readonly PendingRuleChange[]
  readonly accountId: string
  readonly legacyAccountId: string | null
  readonly serverNowIso: string | null
}
