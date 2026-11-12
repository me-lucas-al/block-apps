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
  const blockForbiddenSearchOnNavigation = ({ tabId, frameId, url }: NavigationAttempt) =>
    void searchGuard
      .blockForbiddenSearch({ tabId, frameId, url })
      .catch(logFailure('search guard'))

  const { onBeforeNavigate, onCommitted, onHistoryStateUpdated } = chrome.webNavigation
  onBeforeNavigate.addListener(blockForbiddenSearchOnNavigation, SEARCH_ENGINE_FILTER)
  onCommitted.addListener(blockForbiddenSearchOnNavigation, SEARCH_ENGINE_FILTER)
  onHistoryStateUpdated.addListener(blockForbiddenSearchOnNavigation, SEARCH_ENGINE_FILTER)
}
