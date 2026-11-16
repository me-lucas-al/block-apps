import type { BlockRule } from '@block-apps/core'
import { describe, expect, it, vi } from 'vitest'
import { AppRulesSync } from '../AppRulesSync'

const appRule: BlockRule = {
  id: 'rule-1',
  targetType: 'app',
  target: 'com.instagram.android',
  mode: 'always',
  windows: [],
}

function createSync(userId: string | null) {
  const calls: string[] = []
  const applyRules = vi.fn()
  const applyDueChanges = vi.fn(async () => {
    calls.push('apply')
  })
  const list = vi.fn(async () => {
    calls.push('list')
    return [appRule]
  })
  const sync = new AppRulesSync({
    ruleRepository: { list },
    pendingRuleChanges: { applyDueChanges, listPendingChanges: async () => [] },
    userSession: { currentUserId: async () => userId },
    serverClock: { lastServerTimeIso: () => '2026-11-16T12:00:00.000Z' },
    blocker: { applyRules, refreshEnforcement: vi.fn(), markAppOpened: vi.fn() },
  })
  return { sync, applyRules, list, applyDueChanges, calls }
}

describe('AppRulesSync', () => {
  it('applies due changes first, then hands the rules to the blocker', async () => {
    const { sync, applyRules, calls } = createSync('user-sub-1')
    await sync.sync()
    expect(calls).toEqual(['apply', 'list'])
    expect(applyRules).toHaveBeenCalledWith({
      rules: [appRule],
      pendingChanges: [],
      accountId: 'user-sub-1',
      serverNowIso: '2026-11-16T12:00:00.000Z',
    })
  })

  it('keeps blocker rules untouched when signed out', async () => {
    const { sync, applyRules, list, applyDueChanges } = createSync(null)
    await sync.sync()
    expect(applyDueChanges).not.toHaveBeenCalled()
    expect(list).not.toHaveBeenCalled()
    expect(applyRules).not.toHaveBeenCalled()
  })

  it('pushes rules that were already loaded without reading them again', () => {
    const { sync, applyRules, list } = createSync('user-sub-1')
    sync.push([appRule], [], 'user-sub-1')
    expect(applyRules).toHaveBeenCalledWith({
      rules: [appRule],
      pendingChanges: [],
      accountId: 'user-sub-1',
      serverNowIso: '2026-11-16T12:00:00.000Z',
    })
    expect(list).not.toHaveBeenCalled()
  })
})
