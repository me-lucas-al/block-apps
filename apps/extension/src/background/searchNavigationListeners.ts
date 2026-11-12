import { SEARCH_ENGINE_HOST_FRAGMENTS } from '@block-apps/core'
import type { NavigationAttempt } from '../blocking/keywords/SearchNavigationGuard'
import type { BackgroundServices } from './composition'
import { logFailure } from './logFailure'

const WEB_SCHEMES = ['http', 'https']

const SEARCH_ENGINE_FILTER: chrome.webNavigation.WebNavigationEventFilter = {
  url: SEARCH_ENGINE_HOST_FRAGMENTS.map((hostContains) => ({
    hostContains,
    schemes: WEB_SCHEMES,
  })),
}

export function registerSearchNavigationListeners({ searchGuard }: BackgroundServices): void {
  const blockForbiddenSearch = ({ tabId, frameId, url }: NavigationAttempt) =>
    void searchGuard
      .blockForbiddenSearch({ tabId, frameId, url })
      .catch(logFailure('search guard'))

  chrome.webNavigation.onBeforeNavigate.addListener(blockForbiddenSearch, SEARCH_ENGINE_FILTER)
  chrome.webNavigation.onCommitted.addListener(blockForbiddenSearch, SEARCH_ENGINE_FILTER)
  chrome.webNavigation.onHistoryStateUpdated.addListener(blockForbiddenSearch, SEARCH_ENGINE_FILTER)
}
