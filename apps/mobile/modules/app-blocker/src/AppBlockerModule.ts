import { NativeModule, requireNativeModule } from 'expo'
import type { InstalledApp } from './types'

declare class AppBlockerModule extends NativeModule {
  setRules(rulesJson: string): void
  isAccessibilityEnabled(): boolean
  openAccessibilitySettings(): void
  isDeviceAdminActive(): boolean
  requestDeviceAdmin(): void
  listLaunchableApps(): InstalledApp[]
}

export default requireNativeModule<AppBlockerModule>('AppBlocker')
