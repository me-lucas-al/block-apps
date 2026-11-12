import type { AppSuggestion } from '../../catalog/appSuggestion'
import type { AppOption } from '../options/appOption'
import { normalizeSearchText } from './normalizeSearchText'

export function collectAliasesByPackage(
  suggestions: readonly AppSuggestion[],
): Map<string, readonly string[]> {
  return new Map(suggestions.map((suggestion) => [suggestion.packageName, suggestion.aliases ?? []]))
}

export function matchesSearchQuery(
  option: AppOption,
  normalizedQuery: string,
  aliases: readonly string[],
): boolean {
  const searchableTexts = [option.label, ...aliases].map(normalizeSearchText)
  return (
    searchableTexts.some((text) => text.includes(normalizedQuery)) ||
    option.packageName.toLowerCase().includes(normalizedQuery)
  )
}
