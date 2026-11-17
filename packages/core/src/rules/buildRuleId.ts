import type { TargetType } from './targetTypes'

export function buildRuleId(targetType: TargetType, target: string): string {
  return `${targetType}~${target}`
}
