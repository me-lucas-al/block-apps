import type { BlockRule, PendingChangeKind, PendingRuleChange } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import { SelectionRemovalHolder } from '../SelectionRemovalHolder'
import {
  PendingRuleEditBlocksRemovalError,
  RemovalRequestBlocksEditingError,
} from '../selectionRemovalErrors'

const RULE: BlockRule = {
  id: 'iosSelection~social',
  targetType: 'iosSelection',
  target: 'social',
  mode: 'always',
  windows: [],
}

function pendingChange(kind: PendingChangeKind): PendingRuleChange {
  const hasContent = kind === 'update'
  return {
    id: RULE.id,
    ruleId: RULE.id,
    kind,
    mode: hasContent ? 'schedule' : null,
    windows: hasContent ? [] : null,
    effectiveAt: 'old',
  }
}

function buildKit(pendingChanges: PendingRuleChange[]) {
  const calls: string[] = []
  const holder = new SelectionRemovalHolder({
    ruleRepository: {
      requestSelectionRemoval: async (ruleId) => {
        calls.push(`request:${ruleId}`)
        return { ...pendingChange('selectionRemoval'), effectiveAt: 'new' }
      },
    },
    pendingRuleChanges: {
      listPendingChanges: async () => pendingChanges,
      cancelPendingChange: async (ruleId) => {
        calls.push(`cancel:${ruleId}`)
      },
    },
  })
  return { holder, calls }
}

describe('SelectionRemovalHolder', () => {
  it('asks the server for a selection removal when nothing is pending', async () => {
    const { holder, calls } = buildKit([])
    expect((await holder.holdRemovalOf(RULE)).effectiveAt).toBe('new')
    expect(calls).toEqual([`request:${RULE.id}`])
  })

  it('restarts the cooldown instead of inheriting the deadline of an older removal', async () => {
    const { holder, calls } = buildKit([pendingChange('selectionRemoval')])
    expect((await holder.holdRemovalOf(RULE)).effectiveAt).toBe('new')
    expect(calls).toEqual([`cancel:${RULE.id}`, `request:${RULE.id}`])
  })

  it('refuses to edit apps while the whole group is waiting to be removed', async () => {
    const { holder, calls } = buildKit([pendingChange('delete')])
    await expect(holder.holdRemovalOf(RULE)).rejects.toBeInstanceOf(RemovalRequestBlocksEditingError)
    expect(calls).toEqual([])
  })

  it('refuses to cancel a pending schedule edit', async () => {
    const { holder, calls } = buildKit([pendingChange('update')])
    await expect(holder.holdRemovalOf(RULE)).rejects.toBeInstanceOf(PendingRuleEditBlocksRemovalError)
    expect(calls).toEqual([])
  })

  it('ignores pending changes of other rules', async () => {
    const other = { ...pendingChange('delete'), ruleId: 'other' }
    const { holder, calls } = buildKit([other])
    await holder.holdRemovalOf(RULE)
    expect(calls).toEqual([`request:${RULE.id}`])
  })
})
