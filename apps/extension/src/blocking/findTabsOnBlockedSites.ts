import type { OpenTab } from '../ports/browser/OpenTabsPort'

export type TabOnBlockedSite = {
  readonly tabId: number
  readonly blockedHost: string
}

function readWebHostname(url: string): string | null {
  try {
    const parsed = new URL(url)
    const isWebPage = parsed.protocol === 'https:' || parsed.protocol === 'http:'
    return isWebPage ? parsed.hostname : null
  } catch {
    return null
  }
}

function isSameSiteOrSubdomain(hostname: string, blockedHost: string): boolean {
  return hostname === blockedHost || hostname.endsWith(`.${blockedHost}`)
}

export function findTabsOnBlockedSites(
  openTabs: readonly OpenTab[],
  blockedHosts: readonly string[],
): TabOnBlockedSite[] {
  const tabsOnBlockedSites: TabOnBlockedSite[] = []
  for (const tab of openTabs) {
    const hostname = readWebHostname(tab.url)
    if (!hostname) continue
    const blockedHost = blockedHosts.find((host) => isSameSiteOrSubdomain(hostname, host))
    if (blockedHost) tabsOnBlockedSites.push({ tabId: tab.id, blockedHost })
  }
  return tabsOnBlockedSites
}
