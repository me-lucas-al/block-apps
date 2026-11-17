import type { SetRulesRequest } from '../../../../../modules/app-blocker/src/types'

export type NativeGroupStates = {
  chosenRuleIds: string[]
  unreadableRuleIds: string[]
  unscheduledRuleIds: string[]
  oversizedRuleIds: string[]
  isTotalOverLimit: boolean
}

export interface IosNativeModule {
  setRules(request: SetRulesRequest): Promise<void>
  getAuthorizationStatus(): string
  requestScreenTimeAuthorization(): Promise<string>
  presentAppSelectionPicker(ruleId: string, ownerId: string): Promise<string>
  getGroupStates(ruleIds: string[]): Promise<NativeGroupStates>
  holdPendingSelection(ruleId: string, effectiveAtIso: string, ownerId: string): void
  discardPendingSelection(ruleId: string): void
  hasAcceptedStrictMode(): boolean
  acceptStrictMode(): void
  revokeStrictMode(): void
  reapplyShields(): Promise<void>
  recordAppOpened(): Promise<void>
}
