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

const EXPECTED_JSON = '[{"target":"com.instagram.android","mode":"always","windows":[]}]'

function createSync(email: string | null) {
  const calls: string[] = []
  const setRules = vi.fn()
  const applyDueChanges = vi.fn(async () => {
    calls.push('apply')
  })
  const list = vi.fn(async () => {
    calls.push('list')
    return [appRule]
  })
  const sync = new AppRulesSync({
    repository: { list, applyDueChanges },
    auth: { currentUserEmail: async () => email },
    blocker: { setRules },
  })
  return { sync, setRules, list, applyDueChanges, calls }
}

describe('AppRulesSync', () => {
  it('applies due changes first, then pushes app rules to the native blocker', async () => {
    const { sync, setRules, calls } = createSync('user@example.com')
    await sync.sync()
    expect(calls).toEqual(['apply', 'list'])
    expect(setRules).toHaveBeenCalledWith(EXPECTED_JSON)
  })

  it('keeps native rules untouched when signed out', async () => {
    const { sync, setRules, list, applyDueChanges } = createSync(null)
    await sync.sync()
    expect(applyDueChanges).not.toHaveBeenCalled()
    expect(list).not.toHaveBeenCalled()
    expect(setRules).not.toHaveBeenCalled()
  })

  it('pushes rules that were already loaded without reading them again', () => {
    const { sync, setRules, list } = createSync('user@example.com')
    sync.push([appRule])
    expect(setRules).toHaveBeenCalledWith(EXPECTED_JSON)
    expect(list).not.toHaveBeenCalled()
  })
})
