import { normalizeKeywordText } from './normalizeKeywordText'

const MAX_KEYWORD_LENGTH = 100

export function normalizeKeywordTarget(input: string): string | null {
  const normalized = normalizeKeywordText(input)
  if (!normalized) return null
  if (normalized.length > MAX_KEYWORD_LENGTH) return null
  return normalized
}
