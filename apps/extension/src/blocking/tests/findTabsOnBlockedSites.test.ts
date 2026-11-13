import { describe, expect, it } from 'vitest'
import { findTabsOnBlockedSites } from '../findTabsOnBlockedSites'

describe('findTabsOnBlockedSites', () => {
  it('finds tabs on the blocked site and on its subdomains', () => {
    const openTabs = [
      { id: 1, url: 'https://example.com/watch?v=1' },
      { id: 2, url: 'https://m.example.com/' },
      { id: 3, url: 'https://other.com/' },
    ]

    expect(findTabsOnBlockedSites(openTabs, ['example.com'])).toEqual([
      { tabId: 1, blockedHost: 'example.com' },
      { tabId: 2, blockedHost: 'example.com' },
    ])
  })

  it('ignores sites that only end with the same letters', () => {
    const openTabs = [{ id: 1, url: 'https://notexample.com/' }]

    expect(findTabsOnBlockedSites(openTabs, ['example.com'])).toEqual([])
  })

  it('ignores browser pages and invalid addresses', () => {
    const openTabs = [
      { id: 1, url: 'chrome-extension://abc/blocked.html?site=example.com' },
      { id: 2, url: 'not a url' },
    ]

    expect(findTabsOnBlockedSites(openTabs, ['example.com'])).toEqual([])
  })
})
