export interface IosNativeModule {
  setRules(
    rulesJson: string,
    ownerId: string,
    pendingRuleIds: string[],
    serverNowIso: string | null,
  ): void
  getAuthorizationStatus(): string
  requestScreenTimeAuthorization(): Promise<string>
  presentAppSelectionPicker(ruleId: string, ownerId: string): Promise<string>
  hasSelection(ruleId: string): boolean
  holdPendingSelection(ruleId: string, effectiveAtIso: string, ownerId: string): void
  discardPendingSelection(ruleId: string): void
  hasAcceptedStrictMode(): boolean
  acceptStrictMode(): void
  reapplyShields(): void
  recordAppOpened(): void
  getUnscheduledRuleIds(): string[]
}
