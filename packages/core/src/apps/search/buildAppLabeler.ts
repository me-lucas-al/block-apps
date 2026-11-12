import type { AppSuggestion, KnownApp } from '../catalog/types'

export function buildAppLabeler(
  installed: readonly KnownApp[],
  suggestions: readonly AppSuggestion[],
): (packageName: string) => string {
  const labels = new Map<string, string>()
  for (const app of suggestions) labels.set(app.packageName, app.label)
  for (const app of installed) labels.set(app.packageName, app.label)
  return (packageName) => labels.get(packageName) ?? packageName
}
