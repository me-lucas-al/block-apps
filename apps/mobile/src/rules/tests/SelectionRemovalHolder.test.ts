import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import { SelectionRemovalHolder } from '../SelectionRemovalHolder'
import { PendingRuleEditBlocksRemovalError } from '../selectionRemovalErrors'

const RULE: BlockRule = {
  id: 'iosSelection~social',
  targetType: 'iosSelection',
  target: 'social',
  mode: 'always',
  windows: [],
}

function pendingChange(kind: 'update' | 'delete'): PendingRuleChange {
  return { id: RULE.id, ruleId: RULE.id, kind, mode: RULE.mode, windows: RULE.windows, effectiveAt: 'old' }
}

function buildKit(pendingChanges: PendingRuleChange[]) {
  const calls: string[] = []
  const holder = new SelectionRemovalHolder({
    ruleRepository: {
      requestUpdate: async (ruleId) => {
        calls.push(`update:${ruleId}`)
        return { ...pendingChange('update'), effectiveAt: 'new' }
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
  it('asks the server for a fresh cooldown when nothing is pending', async () => {
    const { holder, calls } = buildKit([])
    expect((await holder.holdRemovalOf(RULE)).effectiveAt).toBe('new')
    expect(calls).toEqual([`update:${RULE.id}`])
  })

  it('restarts the cooldown instead of inheriting the deadline of an older update', async () => {
    const { holder, calls } = buildKit([pendingChange('update')])
    expect((await holder.holdRemovalOf(RULE)).effectiveAt).toBe('new')
    expect(calls).toEqual([`cancel:${RULE.id}`, `update:${RULE.id}`])
  })

  it('refuses to edit apps while the whole group is waiting to be removed', async () => {
    const { holder, calls } = buildKit([pendingChange('delete')])
    await expect(holder.holdRemovalOf(RULE)).rejects.toThrow('Cancele o pedido de remoção')
    expect(calls).toEqual([])
  })

  it('ignores pending changes of other rules', async () => {
    const other = { ...pendingChange('delete'), ruleId: 'other' }
    const { holder, calls } = buildKit([other])
    await holder.holdRemovalOf(RULE)
    expect(calls).toEqual([`update:${RULE.id}`])
  })

  it('refuses to cancel a pending schedule edit that differs from the current rule', async () => {
    const realEdit = { ...pendingChange('update'), mode: 'schedule' as const, windows: [] }
    const { holder, calls } = buildKit([realEdit])
    await expect(holder.holdRemovalOf(RULE)).rejects.toBeInstanceOf(PendingRuleEditBlocksRemovalError)
    expect(calls).toEqual([])
  })
})
