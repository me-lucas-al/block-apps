import { NativeModule, requireNativeModule } from 'expo'
import type { InstalledApp } from './types'

declare class AppBlockerModule extends NativeModule {
  setRules(rulesJson: string): void

  isAccessibilityEnabled(): boolean
  openAccessibilitySettings(): void
  isDeviceAdminActive(): boolean
  requestDeviceAdmin(): void
  listLaunchableApps(): InstalledApp[]

  getAuthorizationStatus(): string
  requestScreenTimeAuthorization(): Promise<string>
  presentAppSelectionPicker(ruleId: string): Promise<string>
  hasSelection(ruleId: string): boolean
  hasPendingSelectionRemoval(ruleId: string): boolean
  holdPendingSelection(ruleId: string, effectiveAtIso: string): void
  getPendingSelectionHold(ruleId: string): string | null
  commitPendingSelection(ruleId: string): void
  discardPendingSelection(ruleId: string): void
  reapplyShields(): void
  getUnscheduledRuleIds(): string[]
}

export default requireNativeModule<AppBlockerModule>('AppBlocker')
