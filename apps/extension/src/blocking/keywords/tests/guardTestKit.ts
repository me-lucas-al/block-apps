import type { BlockRule } from '@block-apps/core'
import type { TabRedirectPort } from '../../../ports/browser/TabRedirectPort'
import { SearchNavigationGuard } from '../SearchNavigationGuard'

export const SEARCH_URL = 'https://www.google.com/search?q=melhor+poker+online'
export const MAIN_FRAME = 0

export function keywordRule(target: string, overrides: Partial<BlockRule> = {}): BlockRule {
  return { id: target, targetType: 'keyword', target, mode: 'always', windows: [], ...overrides }
}

export class FakeTabRedirect implements TabRedirectPort {
  redirections: Array<{ tabId: number; blockedKeyword: string }> = []

  async redirectToBlockedKeywordPage(tabId: number, blockedKeyword: string) {
    this.redirections.push({ tabId, blockedKeyword })
  }
}

export function createGuardOnMondayNoon(rules: BlockRule[], tabRedirect: FakeTabRedirect) {
  return new SearchNavigationGuard({
    ruleCache: { load: async () => rules, save: async () => {} },
    tabRedirect,
    now: () => new Date(2026, 0, 5, 12, 0),
  })
}
