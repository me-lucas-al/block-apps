import type { PlatformAdapters } from '../PlatformAdapters'
import { AndroidAppChoiceAdapter } from './AndroidAppChoiceAdapter'
import { AndroidBlockerAdapter } from './AndroidBlockerAdapter'
import type { AndroidNativeModule } from './module/AndroidNativeModule'
import { AndroidProtectionAdapter } from './AndroidProtectionAdapter'

export function createAndroidAdapters(nativeModule: AndroidNativeModule): PlatformAdapters {
  return {
    platform: 'android',
    listedTargetTypes: ['app', 'keyword'],
    blocker: new AndroidBlockerAdapter(nativeModule),
    protection: new AndroidProtectionAdapter(nativeModule),
    appChoice: new AndroidAppChoiceAdapter(nativeModule),
    groupSelection: null,
    strictModeAcceptance: null,
  }
}
