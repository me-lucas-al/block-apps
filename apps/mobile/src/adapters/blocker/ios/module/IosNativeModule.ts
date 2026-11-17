export interface IosNativeModule {
  setRules(rulesJson: string): void
  getAuthorizationStatus(): string
  requestScreenTimeAuthorization(): Promise<string>
  presentAppSelectionPicker(ruleId: string): Promise<string>
  hasSelection(ruleId: string): boolean
  hasPendingSelectionRemoval(ruleId: string): boolean
  commitPendingSelection(ruleId: string): void
  discardPendingSelection(ruleId: string): void
  reapplyShields(): void
  getUnscheduledRuleIds(): string[]
}
