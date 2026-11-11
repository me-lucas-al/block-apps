import type { BlockRule } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import type { DynamicRulesPort, RedirectRule } from '../../ports/DynamicRulesPort'
import type { RuleCache } from '../../ports/RuleCache'
import { BlockingSynchronizer } from '../BlockingSynchronizer'

const alwaysBlocked: BlockRule = {
  id: 'rule',
  targetType: 'site',
  target: 'example.com',
  mode: 'always',
  windows: [],
}

class FakeDynamicRules implements DynamicRulesPort {
  ids: number[] = []
  calls: Array<{ removed: readonly number[]; added: readonly RedirectRule[] }> = []

  async listIds() {
    return this.ids
  }

  async replace(removed: readonly number[], added: readonly RedirectRule[]) {
    this.calls.push({ removed, added })
    this.ids = added.map((rule) => rule.id)
  }
}

function createSynchronizer(rules: BlockRule[], dynamicRules: FakeDynamicRules) {
  const ruleCache: RuleCache = { load: async () => rules, save: async () => {} }
  return new BlockingSynchronizer({
    ruleCache,
    dynamicRules,
    now: () => new Date(2026, 0, 5, 12, 0),
  })
}

describe('BlockingSynchronizer', () => {
  it('replaces existing dynamic rules with the desired ones', async () => {
    const dynamicRules = new FakeDynamicRules()
    dynamicRules.ids = [7, 8]
    await createSynchronizer([alwaysBlocked], dynamicRules).sync()
    expect(dynamicRules.calls[0]?.removed).toEqual([7, 8])
    expect(dynamicRules.calls[0]?.added).toHaveLength(1)
  })

  it('serializes concurrent syncs so removals see the latest ids', async () => {
    const dynamicRules = new FakeDynamicRules()
    const synchronizer = createSynchronizer([alwaysBlocked], dynamicRules)
    await Promise.all([synchronizer.sync(), synchronizer.sync()])
    expect(dynamicRules.calls[1]?.removed).toEqual([1])
  })
})
