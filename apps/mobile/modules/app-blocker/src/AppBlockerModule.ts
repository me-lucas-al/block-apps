import { NativeModule, requireNativeModule } from 'expo'
import type { InstalledApp } from './types'

declare class AppBlockerModule extends NativeModule {
  setRules(
    rulesJson: string,
    ownerId?: string,
    pendingRuleIds?: string[],
    serverNowIso?: string | null,
  ): Promise<void>

  isAccessibilityEnabled(): boolean
  openAccessibilitySettings(): void
  isDeviceAdminActive(): boolean
  requestDeviceAdmin(): void
  listLaunchableApps(): InstalledApp[]

  getAuthorizationStatus(): string
  requestScreenTimeAuthorization(): Promise<string>
  presentAppSelectionPicker(ruleId: string, ownerId: string): Promise<string>
  getGroupStates(ruleIds: string[]): Promise<{
    chosenRuleIds: string[]
    unreadableRuleIds: string[]
    unscheduledRuleIds: string[]
    oversizedRuleIds: string[]
  }>
  holdPendingSelection(ruleId: string, effectiveAtIso: string, ownerId: string): void
  discardPendingSelection(ruleId: string): void
  hasAcceptedStrictMode(): boolean
  acceptStrictMode(): void
  reapplyShields(): Promise<void>
  recordAppOpened(): Promise<void>
}

export default requireNativeModule<AppBlockerModule>('AppBlocker')
