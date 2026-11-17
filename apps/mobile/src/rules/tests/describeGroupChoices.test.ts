import { describe, expect, it } from 'vitest'
import type { GroupStates } from '../../ports/groupselection/GroupSelectionPort'
import { describeGroupChoices } from '../describeGroupChoices'

const STATES: GroupStates = {
  chosenRuleIds: ['chosen'],
  unreadableRuleIds: ['broken'],
  unscheduledRuleIds: ['crowded'],
  oversizedRuleIds: ['big'],
  isTotalOverLimit: true,
}

describe('describeGroupChoices', () => {
  it('reads each flag from the loaded states', () => {
    const choices = describeGroupChoices(STATES, false)
    expect(choices.hasChosenApps('chosen')).toBe(true)
    expect(choices.hasChosenApps('other')).toBe(false)
    expect(choices.isSelectionUnreadable('broken')).toBe(true)
    expect(choices.isBlockedForLackOfSlots('crowded')).toBe(true)
    expect(choices.isOverAppLimit('big')).toBe(true)
    expect(choices.isTotalOverLimit).toBe(true)
  })

  it('shows no warning while the states are still loading', () => {
    const choices = describeGroupChoices(null, false)
    expect(choices.hasChosenApps('any')).toBe(true)
    expect(choices.isSelectionUnreadable('any')).toBe(false)
    expect(choices.isTotalOverLimit).toBe(false)
  })

  it('marks every group unreadable and does not ask for a new choice when loading the states failed', () => {
    const choices = describeGroupChoices(null, true)
    expect(choices.isSelectionUnreadable('any')).toBe(true)
    expect(choices.hasChosenApps('any')).toBe(true)
    expect(choices.isTotalOverLimit).toBe(false)
  })

  it('does not warn about the total when the groups fit', () => {
    const choices = describeGroupChoices({ ...STATES, isTotalOverLimit: false }, false)
    expect(choices.isTotalOverLimit).toBe(false)
  })
})
