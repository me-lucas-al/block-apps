export type ChooseAppsOutcome = 'saved' | 'removalPending' | 'cancelled'

export interface GroupSelectionPort {
  hasChosenApps(ruleId: string): boolean
  chooseApps(ruleId: string): Promise<ChooseAppsOutcome>
  hasPendingRemoval(ruleId: string): boolean
  commitPendingRemoval(ruleId: string): void
  discardPendingRemoval(ruleId: string): void
  listUnscheduledRuleIds(): readonly string[]
}
