import type { GroupSelectionPort } from '../ports/groupselection/GroupSelectionPort'

export async function hasChosenApps(
  groupSelection: Pick<GroupSelectionPort, 'loadGroupStates'>,
  ruleId: string,
): Promise<boolean> {
  const states = await groupSelection.loadGroupStates([ruleId])
  return states.chosenRuleIds.includes(ruleId)
}
