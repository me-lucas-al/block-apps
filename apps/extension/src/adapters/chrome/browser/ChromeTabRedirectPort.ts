import type { TabRedirectPort } from '../../../ports/browser/TabRedirectPort'

export class ChromeTabRedirectPort implements TabRedirectPort {
  async redirectToBlockedKeywordPage(tabId: number, blockedKeyword: string): Promise<void> {
    const blockedPageUrl = chrome.runtime.getURL(
      `blocked.html?keyword=${encodeURIComponent(blockedKeyword)}`,
    )
    await chrome.tabs.update(tabId, { url: blockedPageUrl })
  }
}
