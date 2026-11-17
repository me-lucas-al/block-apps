import type { BlockRule, TargetType } from '@block-apps/core'

const TARGET_TYPES_ENFORCED_ON_IOS: readonly TargetType[] = ['iosSelection', 'site', 'protection']

export function toIosRulesJson(rules: readonly BlockRule[]): string {
  const enforcedRules = rules
    .filter((rule) => TARGET_TYPES_ENFORCED_ON_IOS.includes(rule.targetType))
    .map(({ id, targetType, target, mode, windows }) => ({ id, targetType, target, mode, windows }))
  return JSON.stringify(enforcedRules)
}
