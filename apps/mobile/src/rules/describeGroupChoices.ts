import type { GroupStates } from '../ports/groupselection/GroupSelectionPort'

export type GroupChoices = {
  hasChosenApps(ruleId: string): boolean
  isSelectionUnreadable(ruleId: string): boolean
  isOverAppLimit(ruleId: string): boolean
  isBlockedForLackOfSlots(ruleId: string): boolean
  isTotalOverLimit: boolean
}

export function describeGroupChoices(
  groupStates: GroupStates | null,
  statesLoadFailed: boolean,
): GroupChoices {
  return {
    hasChosenApps: (ruleId) =>
      statesLoadFailed || !groupStates || groupStates.chosenRuleIds.includes(ruleId),
    isSelectionUnreadable: (ruleId) =>
      statesLoadFailed || (groupStates?.unreadableRuleIds.includes(ruleId) ?? false),
    isOverAppLimit: (ruleId) => groupStates?.oversizedRuleIds.includes(ruleId) ?? false,
    isBlockedForLackOfSlots: (ruleId) => groupStates?.unscheduledRuleIds.includes(ruleId) ?? false,
    isTotalOverLimit: groupStates?.isTotalOverLimit ?? false,
  }
}
