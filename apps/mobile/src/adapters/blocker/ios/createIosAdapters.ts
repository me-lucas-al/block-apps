import type { PlatformAdapters } from '../PlatformAdapters'
import { IosAppChoiceAdapter } from './IosAppChoiceAdapter'
import { IosBlockerAdapter } from './IosBlockerAdapter'
import { IosGroupSelectionAdapter, type CurrentOwnerId } from './selection/IosGroupSelectionAdapter'
import type { IosNativeModule } from './module/IosNativeModule'
import { IosProtectionAdapter } from './IosProtectionAdapter'

export function createIosAdapters(
  nativeModule: IosNativeModule,
  currentOwnerId: CurrentOwnerId,
): PlatformAdapters {
  return {
    platform: 'ios',
    listedTargetTypes: ['iosSelection'],
    blocker: new IosBlockerAdapter({ nativeModule }),
    protection: new IosProtectionAdapter(nativeModule),
    appChoice: new IosAppChoiceAdapter(),
    groupSelection: new IosGroupSelectionAdapter(nativeModule, currentOwnerId),
  }
}
