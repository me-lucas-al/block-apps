import type { PendingRuleChange } from '@block-apps/core'

export interface PendingChangeStore {
  listChangesByUser(userId: string): Promise<PendingRuleChange[]>
  findByRuleId(userId: string, ruleId: string): Promise<PendingRuleChange | null>
  save(userId: string, change: PendingRuleChange): Promise<void>
  cancel(userId: string, ruleId: string): Promise<void>
  listDueByUser(userId: string, nowIso: string): Promise<PendingRuleChange[]>
  listUserIdsWithDueChanges(nowIso: string): Promise<string[]>
}
