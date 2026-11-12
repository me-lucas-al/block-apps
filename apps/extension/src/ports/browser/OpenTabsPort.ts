export type OpenTab = {
  readonly id: number
  readonly url: string
}

export interface OpenTabsPort {
  listOpenTabs(): Promise<OpenTab[]>
  redirectToBlockedSitePage(tabId: number, blockedHost: string): Promise<void>
}
