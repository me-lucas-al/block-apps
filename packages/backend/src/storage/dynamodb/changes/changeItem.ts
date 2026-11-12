import type { PendingRuleChange } from '@block-apps/core'
import { DUE_CHANGES_BUCKET, userPartitionKey } from '../keys/partitionKeys'
import { changeSortKey } from '../keys/sortKeys'

type StoredChange = Pick<
  PendingRuleChange,
  'ruleId' | 'kind' | 'mode' | 'windows' | 'effectiveAt'
>

export function toChangeItem(userId: string, change: PendingRuleChange): Record<string, unknown> {
  return {
    pk: userPartitionKey(userId),
    sk: changeSortKey(change.ruleId),
    ruleId: change.ruleId,
    kind: change.kind,
    mode: change.mode,
    windows: change.windows,
    effectiveAt: change.effectiveAt,
    dueBucket: DUE_CHANGES_BUCKET,
  }
}

export function toPendingChange(item: Record<string, unknown>): PendingRuleChange {
  const stored = item as StoredChange
  return {
    id: stored.ruleId,
    ruleId: stored.ruleId,
    kind: stored.kind,
    mode: stored.mode,
    windows: stored.windows,
    effectiveAt: stored.effectiveAt,
  }
}
