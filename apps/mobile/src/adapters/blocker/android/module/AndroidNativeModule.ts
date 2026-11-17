import type { InstalledApp } from '../../../../../modules/app-blocker'

export interface AndroidNativeModule {
  setRules(rulesJson: string): void
  isAccessibilityEnabled(): boolean
  openAccessibilitySettings(): void
  isDeviceAdminActive(): boolean
  requestDeviceAdmin(): void
  listLaunchableApps(): InstalledApp[]
}
