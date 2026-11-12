import { findBlockedKeyword } from './findBlockedKeyword'

export function matchesBlockedKeyword(
  searchQuery: string,
  keywords: readonly string[],
): boolean {
  return findBlockedKeyword(searchQuery, keywords) !== null
}
