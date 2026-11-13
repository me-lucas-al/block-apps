import type { AndroidNativeModule } from './android/AndroidNativeModule'
import { createAndroidAdapters } from './android/createAndroidAdapters'
import type { PlatformAdapters } from './PlatformAdapters'

export type PlatformAdaptersSources = {
  readonly platformOs: string
  readonly androidModule: AndroidNativeModule
}

export function createPlatformAdapters(sources: PlatformAdaptersSources): PlatformAdapters {
  if (sources.platformOs === 'android') return createAndroidAdapters(sources.androidModule)
  throw new Error(`Unsupported platform: ${sources.platformOs}`)
}
