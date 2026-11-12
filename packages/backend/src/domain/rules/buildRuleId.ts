import type { TargetType } from '@block-apps/core'

export function buildRuleId(targetType: TargetType, target: string): string {
  return `${targetType}~${target}`
}
