import { act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  OVER_LIMIT_STATES,
  WITHIN_LIMIT_STATES,
  buildGroupSelectionWithManualLoads,
  renderGroupAppChoices,
} from './helpers/groupSelectionFixtures'

describe('useGroupAppChoices stale loads', () => {
  it('drops a superseded load that resolves after a newer one', async () => {
    const { groupSelection, settlersByRuleIds } = buildGroupSelectionWithManualLoads()

    const { result, rerender } = renderGroupAppChoices(groupSelection, ['first'])
    rerender(['second'])
    await act(async () => settlersByRuleIds.get('second')?.resolve(WITHIN_LIMIT_STATES))
    await act(async () => settlersByRuleIds.get('first')?.resolve(OVER_LIMIT_STATES))

    expect(result.current.isTotalOverLimit).toBe(false)
    expect(result.current.isOverAppLimit('group')).toBe(false)
  })

  it('drops a superseded failure that arrives after a newer load succeeded', async () => {
    const { groupSelection, settlersByRuleIds } = buildGroupSelectionWithManualLoads()

    const { result, rerender } = renderGroupAppChoices(groupSelection, ['first'])
    rerender(['second'])
    await act(async () => settlersByRuleIds.get('second')?.resolve(OVER_LIMIT_STATES))
    await act(async () => settlersByRuleIds.get('first')?.reject(new Error('late failure')))

    expect(result.current.notice).toBeNull()
    expect(result.current.isSelectionUnreadable('group')).toBe(false)
    expect(result.current.isTotalOverLimit).toBe(true)
  })
})
