import { normalizeSearchText } from '../../apps/search/matching/normalizeSearchText'

export function normalizeKeywordText(text: string): string {
  return normalizeSearchText(text)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}
