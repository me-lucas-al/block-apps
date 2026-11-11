import type { BlockRuleRepository } from '@block-apps/api'
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

function createSync(email: string | null) {
  const setRules = vi.fn()
  const list = vi.fn(async () => [appRule])
  const sync = new AppRulesSync({
    repository: { list } as unknown as BlockRuleRepository,
    auth: { currentUserEmail: async () => email },
    blocker: { setRules },
  })
  return { sync, setRules, list }
}

describe('AppRulesSync', () => {
  it('pushes app rules to the native blocker', async () => {
    const { sync, setRules } = createSync('user@example.com')
    await sync.sync()
    expect(setRules).toHaveBeenCalledWith(
      '[{"target":"com.instagram.android","mode":"always","windows":[]}]',
    )
  })

  it('keeps native rules untouched when signed out', async () => {
    const { sync, setRules, list } = createSync(null)
    await sync.sync()
    expect(list).not.toHaveBeenCalled()
    expect(setRules).not.toHaveBeenCalled()
  })
})
