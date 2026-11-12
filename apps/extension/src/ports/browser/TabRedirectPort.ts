export interface TabRedirectPort {
  redirectToBlockedKeywordPage(tabId: number, blockedKeyword: string): Promise<void>
}
