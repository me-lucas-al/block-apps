import type { AppSuggestion, KnownApp } from '../catalog/types'
import { normalizeSearchText } from './normalizeSearchText'
import { parseAppIdentifier } from './parseAppIdentifier'

export type AppOption = {
  readonly packageName: string
  readonly label: string
  readonly installed: boolean
  readonly suggested: boolean
}

export type SearchAppsInput = {
  readonly installed: readonly KnownApp[]
  readonly suggestions: readonly AppSuggestion[]
  readonly query: string
}

function mergeOptions(
  installed: readonly KnownApp[],
  suggestions: readonly AppSuggestion[],
): AppOption[] {
  const installedLabels = new Map(installed.map((app) => [app.packageName, app.label]))
  const suggestedPackages = new Set(suggestions.map((app) => app.packageName))

  const suggested = suggestions.map((app) => ({
    packageName: app.packageName,
    label: installedLabels.get(app.packageName) ?? app.label,
    installed: installedLabels.has(app.packageName),
    suggested: true,
  }))
  const others = installed
    .filter((app) => !suggestedPackages.has(app.packageName))
    .map((app) => ({ ...app, installed: true, suggested: false }))
    .sort((first, second) => first.label.localeCompare(second.label))

  return [...suggested, ...others]
}

function collectAliases(suggestions: readonly AppSuggestion[]): Map<string, readonly string[]> {
  return new Map(suggestions.map((app) => [app.packageName, app.aliases ?? []]))
}

function matches(option: AppOption, query: string, aliases: readonly string[]): boolean {
  const keywords = [option.label, ...aliases].map(normalizeSearchText)
  return (
    keywords.some((keyword) => keyword.includes(query)) ||
    option.packageName.toLowerCase().includes(query)
  )
}

export function searchApps({ installed, suggestions, query }: SearchAppsInput): AppOption[] {
  const options = mergeOptions(installed, suggestions)
  const normalizedQuery = normalizeSearchText(query.trim())
  if (!normalizedQuery) return options

  const aliases = collectAliases(suggestions)
  const found = options.filter((option) =>
    matches(option, normalizedQuery, aliases.get(option.packageName) ?? []),
  )

  const typedPackage = parseAppIdentifier(query)
  if (!typedPackage) return found

  const known = options.find(
    (option) => option.packageName.toLowerCase() === typedPackage.toLowerCase(),
  )
  if (known) return [known, ...found.filter((option) => option !== known)]

  const unverified = {
    packageName: typedPackage,
    label: typedPackage,
    installed: false,
    suggested: false,
  }
  return [...found, unverified]
}
