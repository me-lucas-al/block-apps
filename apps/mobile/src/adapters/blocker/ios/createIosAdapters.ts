import type { PlatformAdapters } from '../PlatformAdapters'
import { IosAppChoiceAdapter } from './IosAppChoiceAdapter'
import { IosBlockerAdapter } from './IosBlockerAdapter'
import { IosGroupSelectionAdapter } from './selection/IosGroupSelectionAdapter'
import type { IosNativeModule } from './module/IosNativeModule'
import { IosProtectionAdapter } from './IosProtectionAdapter'

export function createIosAdapters(nativeModule: IosNativeModule): PlatformAdapters {
  const groupSelection = new IosGroupSelectionAdapter(nativeModule)
  return {
    platform: 'ios',
    listedTargetTypes: ['iosSelection'],
    needsBackgroundRefresh: true,
    blocker: new IosBlockerAdapter({ nativeModule, groupSelection }),
    protection: new IosProtectionAdapter(nativeModule),
    appChoice: new IosAppChoiceAdapter(),
    groupSelection,
  }
}
