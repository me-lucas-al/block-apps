import type { BlockRule } from '@block-apps/core'

export function toNativeRulesJson(rules: readonly BlockRule[]): string {
  const appRules = rules
    .filter((rule) => rule.targetType === 'app')
    .map(({ id, target, mode, windows }) => ({ id, target, mode, windows }))
  return JSON.stringify(appRules)
}
