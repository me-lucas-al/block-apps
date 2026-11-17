export type ChooseAppsOutcome =
  | 'saved'
  | 'removalPending'
  | 'cancelled'
  | 'notAuthorized'
  | 'notOwner'

export type SelectionStatus = 'absent' | 'unreadable' | 'found'

export interface GroupSelectionPort {
  hasChosenApps(ruleId: string): boolean
  selectionStatusOf(ruleId: string): SelectionStatus
  chooseApps(ruleId: string): Promise<ChooseAppsOutcome>
  holdPendingRemoval(ruleId: string, effectiveAtIso: string): Promise<void>
  discardPendingRemoval(ruleId: string): void
  listUnscheduledRuleIds(): readonly string[]
}
