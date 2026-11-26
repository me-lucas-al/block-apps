import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import type {
  GroupSelectionPort,
  GroupStates,
} from '../../../../ports/groupselection/GroupSelectionPort'
import { useGroupAppChoices } from '../../useGroupAppChoices'

export const OVER_LIMIT_STATES: GroupStates = {
  chosenRuleIds: ['group'],
  unreadableRuleIds: [],
  unscheduledRuleIds: [],
  oversizedRuleIds: ['group'],
  isTotalOverLimit: true,
}

export const WITHIN_LIMIT_STATES: GroupStates = {
  chosenRuleIds: ['group'],
  unreadableRuleIds: [],
  unscheduledRuleIds: [],
  oversizedRuleIds: [],
  isTotalOverLimit: false,
}

export type StatesLoadSettlers = {
  resolve: (states: GroupStates) => void
  reject: (failure: unknown) => void
}

export function buildGroupSelection(
  loadGroupStates: GroupSelectionPort['loadGroupStates'],
): GroupSelectionPort {
  return {
    loadGroupStates,
    chooseApps: vi.fn(),
    holdPendingRemoval: vi.fn(),
    discardPendingRemoval: vi.fn(),
  }
}

export function buildGroupSelectionWithManualLoads(): {
  groupSelection: GroupSelectionPort
  settlersByRuleIds: Map<string, StatesLoadSettlers>
} {
  const settlersByRuleIds = new Map<string, StatesLoadSettlers>()
  const groupSelection = buildGroupSelection(
    (ruleIds) =>
      new Promise<GroupStates>((resolve, reject) =>
        settlersByRuleIds.set(ruleIds.join(','), { resolve, reject }),
      ),
  )
  return { groupSelection, settlersByRuleIds }
}

export function renderGroupAppChoices(groupSelection: GroupSelectionPort, initialRuleIds: string[]) {
  return renderHook(
    (ruleIds: string[]) =>
      useGroupAppChoices({
        groupSelection,
        ruleIds,
        appliedVersion: 0,
        holdSelectionRemovalUntilCooldownEnds: vi.fn(),
      }),
    { initialProps: initialRuleIds },
  )
}
