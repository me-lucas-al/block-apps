import type { BlockRule } from '@block-apps/core'
import { userPartitionKey } from '../keys/partitionKeys'
import { ruleSortKey } from '../keys/sortKeys'

type StoredRule = Pick<BlockRule, 'id' | 'targetType' | 'target' | 'mode' | 'windows'>

export function toRuleItem(userId: string, rule: BlockRule): Record<string, unknown> {
  return { pk: userPartitionKey(userId), sk: ruleSortKey(rule.id), ...rule }
}

export function toBlockRule(item: Record<string, unknown>): BlockRule {
  const stored = item as StoredRule
  return {
    id: stored.id,
    targetType: stored.targetType,
    target: stored.target,
    mode: stored.mode,
    windows: stored.windows,
  }
}
