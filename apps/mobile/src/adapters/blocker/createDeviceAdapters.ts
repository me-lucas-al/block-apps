import { Platform } from 'react-native'
import { AppBlocker } from '../../../modules/app-blocker'
import { createPlatformAdapters } from './createPlatformAdapters'
import type { PlatformAdapters } from './PlatformAdapters'

export function createDeviceAdapters(): PlatformAdapters {
  return createPlatformAdapters({ platformOs: Platform.OS, nativeModule: AppBlocker })
}
