import type { BlockRule, TargetType } from '@block-apps/core'

export function keepListedTypes(
  rules: BlockRule[],
  listedTypes: readonly TargetType[],
): BlockRule[] {
  return rules.filter((rule) => listedTypes.includes(rule.targetType))
}
