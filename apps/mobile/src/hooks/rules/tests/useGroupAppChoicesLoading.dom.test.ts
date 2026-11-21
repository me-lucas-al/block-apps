import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { GroupStates } from '../../../ports/groupselection/GroupSelectionPort'
import {
  OVER_LIMIT_STATES,
  buildGroupSelection,
  renderGroupAppChoices,
} from './helpers/groupSelectionFixtures'

describe('useGroupAppChoices state loading', () => {
  it('shows no warning while the group states are loading', () => {
    const groupSelection = buildGroupSelection(() => new Promise<GroupStates>(() => undefined))

    const { result } = renderGroupAppChoices(groupSelection, ['group'])

    expect(result.current.isTotalOverLimit).toBe(false)
    expect(result.current.isOverAppLimit('group')).toBe(false)
    expect(result.current.isSelectionUnreadable('group')).toBe(false)
    expect(result.current.notice).toBeNull()
  })

  it('exposes the loaded states once the load finishes', async () => {
    const groupSelection = buildGroupSelection(() => Promise.resolve(OVER_LIMIT_STATES))

    const { result } = renderGroupAppChoices(groupSelection, ['group'])

    await waitFor(() => expect(result.current.isTotalOverLimit).toBe(true))
    expect(result.current.isOverAppLimit('group')).toBe(true)
    expect(result.current.notice).toBeNull()
  })

  it('warns and marks every group unreadable when the load fails', async () => {
    const groupSelection = buildGroupSelection(() => Promise.reject(new Error('native failure')))

    const { result } = renderGroupAppChoices(groupSelection, ['group'])

    await waitFor(() => expect(result.current.notice).not.toBeNull())
    expect(result.current.isSelectionUnreadable('group')).toBe(true)
    expect(result.current.hasChosenApps('group')).toBe(true)
    expect(result.current.isTotalOverLimit).toBe(false)
  })
})
