export type NativeGroupStates = {
  chosenRuleIds: string[]
  unreadableRuleIds: string[]
  unscheduledRuleIds: string[]
}

export interface IosNativeModule {
  setRules(
    rulesJson: string,
    ownerId: string,
    pendingRuleIds: string[],
    serverNowIso: string | null,
  ): Promise<void>
  getAuthorizationStatus(): string
  requestScreenTimeAuthorization(): Promise<string>
  presentAppSelectionPicker(ruleId: string, ownerId: string): Promise<string>
  getGroupStates(ruleIds: string[]): Promise<NativeGroupStates>
  holdPendingSelection(ruleId: string, effectiveAtIso: string, ownerId: string): void
  discardPendingSelection(ruleId: string): void
  hasAcceptedStrictMode(): boolean
  acceptStrictMode(): void
  reapplyShields(): Promise<void>
  recordAppOpened(): Promise<void>
}
