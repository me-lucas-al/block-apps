import type { BlockRule, PendingRuleChange } from '@block-apps/core'

export function applyChangeToRule(rule: BlockRule, change: PendingRuleChange): BlockRule {
  if (!change.mode) return rule
  return { ...rule, mode: change.mode, windows: change.windows ?? [] }
}
