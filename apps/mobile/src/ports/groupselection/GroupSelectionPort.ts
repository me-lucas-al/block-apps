export type ChooseAppsOutcome = 'saved' | 'removalPending' | 'cancelled' | 'notAuthorized'

export interface GroupSelectionPort {
  hasChosenApps(ruleId: string): boolean
  chooseApps(ruleId: string): Promise<ChooseAppsOutcome>
  hasPendingRemoval(ruleId: string): boolean
  holdPendingRemoval(ruleId: string, effectiveAtIso: string): void
  readPendingRemovalHold(ruleId: string): string | null
  commitPendingRemoval(ruleId: string): void
  discardPendingRemoval(ruleId: string): void
  listUnscheduledRuleIds(): readonly string[]
}
