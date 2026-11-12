import { normalizeKeywordText } from './normalizeKeywordText'

function containsWholePhrase(paddedQuery: string, phrase: string): boolean {
  return paddedQuery.includes(` ${phrase} `)
}

export function findBlockedKeyword(
  searchQuery: string,
  keywords: readonly string[],
): string | null {
  const normalizedQuery = normalizeKeywordText(searchQuery)
  if (!normalizedQuery) return null

  const paddedQuery = ` ${normalizedQuery} `
  const blockedKeyword = keywords.find((keyword) => {
    const phrase = normalizeKeywordText(keyword)
    return phrase !== '' && containsWholePhrase(paddedQuery, phrase)
  })
  return blockedKeyword ?? null
}
