import { normalizeKeywordText } from '../keywords/matching/normalizeKeywordText'

const MAX_SELECTION_NAME_LENGTH = 50

export function normalizeIosSelectionTarget(input: string): string | null {
  const slug = normalizeKeywordText(input).replace(/\s+/g, '-')
  if (!slug) return null
  if (slug.length > MAX_SELECTION_NAME_LENGTH) return null
  return slug
}
