import type { TabRedirectPort } from '../../ports/browser/TabRedirectPort'
import type { RuleCache } from '../../ports/data/RuleCache'
import { findBlockingKeyword } from './findBlockingKeyword'

const MAIN_FRAME_ID = 0

export type NavigationAttempt = {
  readonly tabId: number
  readonly frameId: number
  readonly url: string
}

export type SearchNavigationGuardDependencies = {
  readonly ruleCache: RuleCache
  readonly tabRedirect: TabRedirectPort
  readonly now: () => Date
}

export class SearchNavigationGuard {
  constructor(private readonly dependencies: SearchNavigationGuardDependencies) {}

  async blockForbiddenSearch(attempt: NavigationAttempt): Promise<void> {
    if (attempt.frameId !== MAIN_FRAME_ID) return

    const { ruleCache, tabRedirect, now } = this.dependencies
    const blockingKeyword = findBlockingKeyword(attempt.url, await ruleCache.load(), now())
    if (!blockingKeyword) return

    await tabRedirect.redirectToBlockedKeywordPage(attempt.tabId, blockingKeyword)
  }
}
