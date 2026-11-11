import type { AppSuggestion, KnownApp } from '../catalog/types'
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

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

function mergeOptions(
  installed: readonly KnownApp[],
  suggestions: readonly AppSuggestion[],
): AppOption[] {
  const installedPackages = new Set(installed.map((app) => app.packageName))
  const suggestedPackages = new Set(suggestions.map((app) => app.packageName))

  const suggested = suggestions.map((app) => ({
    packageName: app.packageName,
    label: installed.find((candidate) => candidate.packageName === app.packageName)?.label ?? app.label,
    installed: installedPackages.has(app.packageName),
    suggested: true,
  }))
  const others = installed
    .filter((app) => !suggestedPackages.has(app.packageName))
    .map((app) => ({ ...app, installed: true, suggested: false }))
    .sort((first, second) => first.label.localeCompare(second.label))

  return [...suggested, ...others]
}

function matches(option: AppOption, normalizedQuery: string): boolean {
  return (
    normalize(option.label).includes(normalizedQuery) ||
    option.packageName.toLowerCase().includes(normalizedQuery)
  )
}

export function searchApps({ installed, suggestions, query }: SearchAppsInput): AppOption[] {
  const options = mergeOptions(installed, suggestions)
  const normalizedQuery = normalize(query.trim())
  if (!normalizedQuery) return options

  const found = options.filter((option) => matches(option, normalizedQuery))
  const customPackage = parseAppIdentifier(query)
  const isKnown = customPackage && options.some((option) => option.packageName === customPackage)
  if (!customPackage || isKnown) return found

  const custom = { packageName: customPackage, label: customPackage, installed: false, suggested: false }
  return [custom, ...found]
}
