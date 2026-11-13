import type { AndroidNativeModule } from './android/module/AndroidNativeModule'
import { createAndroidAdapters } from './android/createAndroidAdapters'
import type { IosNativeModule } from './ios/module/IosNativeModule'
import { createIosAdapters } from './ios/createIosAdapters'
import type { PlatformAdapters } from './PlatformAdapters'

export type PlatformAdaptersSources = {
  readonly platformOs: string
  readonly nativeModule: AndroidNativeModule & IosNativeModule
}

export function createPlatformAdapters(sources: PlatformAdaptersSources): PlatformAdapters {
  if (sources.platformOs === 'android') return createAndroidAdapters(sources.nativeModule)
  if (sources.platformOs === 'ios') return createIosAdapters(sources.nativeModule)
  throw new Error(`Unsupported platform: ${sources.platformOs}`)
}
