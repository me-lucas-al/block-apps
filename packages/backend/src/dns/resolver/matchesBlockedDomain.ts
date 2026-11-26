import { isBlockedNow, type BlockRule } from '@block-apps/core'

export function normalizeQueriedDomain(name: string): string {
  return name.trim().toLowerCase().replace(/\.+$/, '')
}

export function matchesDomainRule(queriedDomain: string, ruleTarget: string): boolean {
  const target = normalizeQueriedDomain(ruleTarget)
  if (!queriedDomain || !target) return false
  return queriedDomain === target || queriedDomain.endsWith(`.${target}`)
}

export function isDomainBlockedNow(
  queriedDomain: string,
  rules: readonly BlockRule[],
  zonedNow: Date,
): boolean {
  const normalized = normalizeQueriedDomain(queriedDomain)
  if (!normalized) return false
  return rules.some(
    (rule) =>
      rule.targetType === 'site' &&
      matchesDomainRule(normalized, rule.target) &&
      isBlockedNow(rule, zonedNow),
  )
}
