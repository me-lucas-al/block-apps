import type { InstalledApp } from '../../../../../modules/app-blocker'

export interface AndroidNativeModule {
  setRules(rulesJson: string, ownerId: string, legacyOwnerId: string | null): void
  isAccessibilityEnabled(): boolean
  openAccessibilitySettings(): void
  isDeviceAdminActive(): boolean
  requestDeviceAdmin(): void
  listLaunchableApps(): InstalledApp[]
}
