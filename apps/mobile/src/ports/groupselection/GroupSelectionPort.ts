export type ChooseAppsOutcome =
  | 'saved'
  | 'removalPending'
  | 'cancelled'
  | 'notAuthorized'
  | 'notOwner'

export interface GroupSelectionPort {
  hasChosenApps(ruleId: string): boolean
  chooseApps(ruleId: string): Promise<ChooseAppsOutcome>
  holdPendingRemoval(ruleId: string, effectiveAtIso: string): Promise<void>
  discardPendingRemoval(ruleId: string): void
  listUnscheduledRuleIds(): readonly string[]
}
