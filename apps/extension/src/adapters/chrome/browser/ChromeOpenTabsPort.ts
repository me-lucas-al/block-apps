import type { OpenTab, OpenTabsPort } from '../../../ports/browser/OpenTabsPort'

function toOpenTab(tab: chrome.tabs.Tab): OpenTab | null {
  if (tab.id === undefined || !tab.url) return null
  return { id: tab.id, url: tab.url }
}

export class ChromeOpenTabsPort implements OpenTabsPort {
  async listOpenTabs(): Promise<OpenTab[]> {
    const tabs = await chrome.tabs.query({})
    return tabs.map(toOpenTab).filter((tab): tab is OpenTab => tab !== null)
  }

  async redirectToBlockedSitePage(tabId: number, blockedHost: string): Promise<void> {
    const blockedPageUrl = chrome.runtime.getURL(
      `blocked.html?site=${encodeURIComponent(blockedHost)}`,
    )
    await chrome.tabs.update(tabId, { url: blockedPageUrl })
  }
}
