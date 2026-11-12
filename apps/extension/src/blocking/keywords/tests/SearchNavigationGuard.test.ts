import type { BlockRule } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import type { TabRedirectPort } from '../../../ports/browser/TabRedirectPort'
import { SearchNavigationGuard } from '../SearchNavigationGuard'

const SEARCH_URL = 'https://www.google.com/search?q=melhor+poker+online'
const MAIN_FRAME = 0

function keywordRule(target: string, overrides: Partial<BlockRule> = {}): BlockRule {
  return { id: target, targetType: 'keyword', target, mode: 'always', windows: [], ...overrides }
}

class FakeTabRedirect implements TabRedirectPort {
  redirections: Array<{ tabId: number; blockedKeyword: string }> = []

  async redirectToBlockedKeywordPage(tabId: number, blockedKeyword: string) {
    this.redirections.push({ tabId, blockedKeyword })
  }
}

function createGuard(rules: BlockRule[], tabRedirect: FakeTabRedirect) {
  return new SearchNavigationGuard({
    ruleCache: { load: async () => rules, save: async () => {} },
    tabRedirect,
    now: () => new Date(2026, 0, 5, 12, 0),
  })
}

describe('SearchNavigationGuard', () => {
  it('redirects the tab when the search contains a blocked keyword', async () => {
    const tabRedirect = new FakeTabRedirect()
    await createGuard([keywordRule('poker')], tabRedirect).blockForbiddenSearch({
      tabId: 7,
      frameId: MAIN_FRAME,
      url: SEARCH_URL,
    })
    expect(tabRedirect.redirections).toEqual([{ tabId: 7, blockedKeyword: 'poker' }])
  })

  it('leaves searches without blocked keywords alone', async () => {
    const tabRedirect = new FakeTabRedirect()
    await createGuard([keywordRule('cassino')], tabRedirect).blockForbiddenSearch({
      tabId: 7,
      frameId: MAIN_FRAME,
      url: SEARCH_URL,
    })
    expect(tabRedirect.redirections).toEqual([])
  })

  it('ignores navigations that are not searches', async () => {
    const tabRedirect = new FakeTabRedirect()
    await createGuard([keywordRule('poker')], tabRedirect).blockForbiddenSearch({
      tabId: 7,
      frameId: MAIN_FRAME,
      url: 'https://example.com/poker',
    })
    expect(tabRedirect.redirections).toEqual([])
  })

  it('ignores subframe navigations', async () => {
    const tabRedirect = new FakeTabRedirect()
    await createGuard([keywordRule('poker')], tabRedirect).blockForbiddenSearch({
      tabId: 7,
      frameId: 3,
      url: SEARCH_URL,
    })
    expect(tabRedirect.redirections).toEqual([])
  })

  it('ignores site and app rules', async () => {
    const tabRedirect = new FakeTabRedirect()
    const rules = [
      keywordRule('poker', { targetType: 'site' }),
      keywordRule('poker', { targetType: 'app' }),
    ]
    await createGuard(rules, tabRedirect).blockForbiddenSearch({
      tabId: 7,
      frameId: MAIN_FRAME,
      url: SEARCH_URL,
    })
    expect(tabRedirect.redirections).toEqual([])
  })

  it('respects the allowed windows of schedule rules', async () => {
    const tabRedirect = new FakeTabRedirect()
    const allowedMondayNoon = { days: [1] as const, start: '11:00', end: '13:00' }
    const rule = keywordRule('poker', { mode: 'schedule', windows: [allowedMondayNoon] })
    await createGuard([rule], tabRedirect).blockForbiddenSearch({
      tabId: 7,
      frameId: MAIN_FRAME,
      url: SEARCH_URL,
    })
    expect(tabRedirect.redirections).toEqual([])
  })

  it('blocks schedule rules outside the allowed windows', async () => {
    const tabRedirect = new FakeTabRedirect()
    const allowedMondayEvening = { days: [1] as const, start: '18:00', end: '20:00' }
    const rule = keywordRule('poker', { mode: 'schedule', windows: [allowedMondayEvening] })
    await createGuard([rule], tabRedirect).blockForbiddenSearch({
      tabId: 7,
      frameId: MAIN_FRAME,
      url: SEARCH_URL,
    })
    expect(tabRedirect.redirections).toHaveLength(1)
  })
})
