import type { BlockRule, PendingRuleChange } from '@block-apps/core'

export type RulesSnapshot = {
  readonly rules: readonly BlockRule[]
  readonly pendingChanges: readonly PendingRuleChange[]
  readonly accountId: string
  readonly serverNowIso: string | null
}
