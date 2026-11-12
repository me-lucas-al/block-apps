import type { AppSuggestion, KnownApp } from '../../catalog/appSuggestion'
import type { AppOption } from './appOption'

export function mergeInstalledAndSuggestedApps(
  installedApps: readonly KnownApp[],
  suggestions: readonly AppSuggestion[],
): AppOption[] {
  const installedLabelByPackage = new Map(installedApps.map((app) => [app.packageName, app.label]))
  const suggestedPackages = new Set(suggestions.map((suggestion) => suggestion.packageName))

  const suggestedOptions = suggestions.map((suggestion) => ({
    packageName: suggestion.packageName,
    label: installedLabelByPackage.get(suggestion.packageName) ?? suggestion.label,
    installed: installedLabelByPackage.has(suggestion.packageName),
    suggested: true,
  }))
  const installedOnlyOptions = installedApps
    .filter((app) => !suggestedPackages.has(app.packageName))
    .map((app) => ({ ...app, installed: true, suggested: false }))
    .sort((first, second) => first.label.localeCompare(second.label))

  return [...suggestedOptions, ...installedOnlyOptions]
}
