import type { PlatformAdapters } from '../PlatformAdapters'
import { AndroidAppChoiceAdapter } from './AndroidAppChoiceAdapter'
import { AndroidBlockerAdapter } from './AndroidBlockerAdapter'
import type { AndroidNativeModule } from './AndroidNativeModule'
import { AndroidProtectionAdapter } from './AndroidProtectionAdapter'

export function createAndroidAdapters(nativeModule: AndroidNativeModule): PlatformAdapters {
  return {
    platform: 'android',
    blocker: new AndroidBlockerAdapter(nativeModule),
    protection: new AndroidProtectionAdapter(nativeModule),
    appChoice: new AndroidAppChoiceAdapter(nativeModule),
  }
}
