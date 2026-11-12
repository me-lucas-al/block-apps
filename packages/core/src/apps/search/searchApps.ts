import type { AppSuggestion, KnownApp } from '../catalog/appSuggestion'
import { collectAliasesByPackage, matchesSearchQuery } from './matching/matchesSearchQuery'
import { normalizeSearchText } from './matching/normalizeSearchText'
import { placeTypedPackageOption } from './matching/placeTypedPackageOption'
import type { AppOption } from './options/appOption'
import { mergeInstalledAndSuggestedApps } from './options/mergeInstalledAndSuggestedApps'

export type SearchAppsInput = {
  readonly installed: readonly KnownApp[]
  readonly suggestions: readonly AppSuggestion[]
  readonly query: string
}

export function searchApps({ installed, suggestions, query }: SearchAppsInput): AppOption[] {
  const allOptions = mergeInstalledAndSuggestedApps(installed, suggestions)
  const normalizedQuery = normalizeSearchText(query.trim())
  if (!normalizedQuery) return allOptions

  const aliasesByPackage = collectAliasesByPackage(suggestions)
  const matchingOptions = allOptions.filter((option) =>
    matchesSearchQuery(option, normalizedQuery, aliasesByPackage.get(option.packageName) ?? []),
  )
  return placeTypedPackageOption(query, allOptions, matchingOptions)
}
