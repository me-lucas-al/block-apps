import {
  type BlockRule,
  extractSearchQuery,
  findBlockedKeyword,
  isBlockedNow,
} from '@block-apps/core'

export function findBlockingKeyword(
  navigatedUrl: string,
  rules: readonly BlockRule[],
  now: Date,
): string | null {
  const searchQuery = extractSearchQuery(navigatedUrl)
  if (!searchQuery) return null

  const activeKeywords = rules
    .filter((rule) => rule.targetType === 'keyword' && isBlockedNow(rule, now))
    .map((rule) => rule.target)
  return findBlockedKeyword(searchQuery, activeKeywords)
}
