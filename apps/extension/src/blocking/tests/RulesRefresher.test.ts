import type { BlockRule } from '@block-apps/core'
import { describe, expect, it, vi } from 'vitest'
import { RulesRefresher } from '../RulesRefresher'

const remoteRule: BlockRule = {
  id: 'remote',
  targetType: 'site',
  target: 'example.com',
  mode: 'always',
  windows: [],
}

function createRefresher(options: { hasSession: boolean; listFails?: boolean }) {
  const calls: string[] = []
  const save = vi.fn(async () => {})
  const sync = vi.fn(async () => {})
  const applyDueChanges = vi.fn(async () => {
    calls.push('apply')
  })
  const list = vi.fn(async () => {
    calls.push('list')
    if (options.listFails) throw new Error('offline')
    return [remoteRule]
  })
  const refresher = new RulesRefresher({
    repository: { list, applyDueChanges },
    ruleCache: { load: async () => [], save },
    sessionGate: { hasSession: async () => options.hasSession },
    enforcer: { sync },
  })
  return { refresher, save, sync, list, applyDueChanges, calls }
}

describe('RulesRefresher', () => {
  it('applies due changes, caches remote rules and enforces them', async () => {
    const { refresher, save, sync, calls } = createRefresher({ hasSession: true })
    await refresher.refresh()
    expect(calls).toEqual(['apply', 'list'])
    expect(save).toHaveBeenCalledWith([remoteRule])
    expect(sync).toHaveBeenCalledOnce()
  })

  it('keeps cached rules and still enforces when signed out', async () => {
    const { refresher, save, list, applyDueChanges, sync } = createRefresher({ hasSession: false })
    await refresher.refresh()
    expect(applyDueChanges).not.toHaveBeenCalled()
    expect(list).not.toHaveBeenCalled()
    expect(save).not.toHaveBeenCalled()
    expect(sync).toHaveBeenCalledOnce()
  })

  it('still enforces cached rules when the server is unreachable', async () => {
    const { refresher, save, sync } = createRefresher({ hasSession: true, listFails: true })
    await expect(refresher.refresh()).rejects.toThrow('offline')
    expect(save).not.toHaveBeenCalled()
    expect(sync).toHaveBeenCalledOnce()
  })
})
