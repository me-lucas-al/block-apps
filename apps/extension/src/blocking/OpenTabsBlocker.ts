import type { OpenTabsPort } from '../ports/browser/OpenTabsPort'
import { findTabsOnBlockedSites } from './findTabsOnBlockedSites'

export class OpenTabsBlocker {
  constructor(private readonly openTabs: OpenTabsPort) {}

  async blockOpenTabs(blockedHosts: readonly string[]): Promise<void> {
    if (blockedHosts.length === 0) return
    const tabs = await this.openTabs.listOpenTabs()
    const tabsOnBlockedSites = findTabsOnBlockedSites(tabs, blockedHosts)
    await Promise.all(
      tabsOnBlockedSites.map(({ tabId, blockedHost }) =>
        this.openTabs.redirectToBlockedSitePage(tabId, blockedHost),
      ),
    )
  }
}
