import { NativeModule, requireNativeModule } from 'expo'
import type { InstalledApp } from './types'

declare class AppBlockerModule extends NativeModule {
  setRules(
    rulesJson: string,
    ownerId?: string,
    pendingRuleIds?: string[],
    serverNowIso?: string | null,
  ): void

  isAccessibilityEnabled(): boolean
  openAccessibilitySettings(): void
  isDeviceAdminActive(): boolean
  requestDeviceAdmin(): void
  listLaunchableApps(): InstalledApp[]

  getAuthorizationStatus(): string
  requestScreenTimeAuthorization(): Promise<string>
  presentAppSelectionPicker(ruleId: string, ownerId: string): Promise<string>
  hasSelection(ruleId: string): boolean
  getSelectionStatus(ruleId: string): string
  holdPendingSelection(ruleId: string, effectiveAtIso: string, ownerId: string): void
  discardPendingSelection(ruleId: string): void
  hasAcceptedStrictMode(): boolean
  acceptStrictMode(): void
  revokeStrictMode(): void
  reapplyShields(): void
  recordAppOpened(): void
  getUnscheduledRuleIds(): string[]
}

export default requireNativeModule<AppBlockerModule>('AppBlocker')
