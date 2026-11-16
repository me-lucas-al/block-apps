import { Platform } from 'react-native'
import { AppBlocker } from '../../../modules/app-blocker'
import { createPlatformAdapters } from './createPlatformAdapters'
import type { CurrentOwnerId } from './ios/selection/IosGroupSelectionAdapter'
import type { PlatformAdapters } from './PlatformAdapters'

export function createDeviceAdapters(currentOwnerId: CurrentOwnerId): PlatformAdapters {
  return createPlatformAdapters({ platformOs: Platform.OS, nativeModule: AppBlocker, currentOwnerId })
}
