import {
  type AppSuggestion,
  type KnownApp,
  POPULAR_ANDROID_APPS,
  buildAppLabeler,
} from '@block-apps/core'
import { useMemo } from 'react'

type AppCatalog = {
  suggestions: readonly AppSuggestion[]
  labelFor: (packageName: string) => string
}

export function useAppCatalog(installedApps: readonly KnownApp[]): AppCatalog {
  return useMemo(
    () => ({
      suggestions: POPULAR_ANDROID_APPS,
      labelFor: buildAppLabeler(installedApps, POPULAR_ANDROID_APPS),
    }),
    [installedApps],
  )
}
