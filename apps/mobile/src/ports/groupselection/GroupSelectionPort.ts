export type ChooseAppsOutcome =
  | 'saved'
  | 'removalPending'
  | 'cancelled'
  | 'notAuthorized'
  | 'notOwner'

export type GroupStates = {
  readonly chosenRuleIds: readonly string[]
  readonly unreadableRuleIds: readonly string[]
  readonly unscheduledRuleIds: readonly string[]
  readonly oversizedRuleIds: readonly string[]
  readonly isTotalOverLimit: boolean
}

export interface GroupSelectionPort {
  loadGroupStates(ruleIds: readonly string[]): Promise<GroupStates>
  chooseApps(ruleId: string): Promise<ChooseAppsOutcome>
  holdPendingRemoval(ruleId: string, effectiveAtIso: string): Promise<void>
  discardPendingRemoval(ruleId: string): void
}
