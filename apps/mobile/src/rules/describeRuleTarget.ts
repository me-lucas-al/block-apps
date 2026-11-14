import type { BlockRule } from '@block-apps/core'

export function describeRuleTarget(
  rule: BlockRule,
  labelForApp: (packageName: string) => string,
): string {
  if (rule.targetType === 'keyword') return `Busca: ${rule.target}`
  return labelForApp(rule.target)
}
