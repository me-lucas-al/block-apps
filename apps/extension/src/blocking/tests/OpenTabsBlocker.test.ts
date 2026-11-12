import { describe, expect, it, vi } from 'vitest'
import type { OpenTabsPort } from '../../ports/browser/OpenTabsPort'
import { OpenTabsBlocker } from '../OpenTabsBlocker'

function createOpenTabs(urls: readonly string[]): OpenTabsPort {
  return {
    listOpenTabs: vi.fn(async () => urls.map((url, index) => ({ id: index + 1, url }))),
    redirectToBlockedSitePage: vi.fn(async () => {}),
  }
}

describe('OpenTabsBlocker', () => {
  it('sends tabs that are already on a blocked site to the blocked page', async () => {
    const openTabs = createOpenTabs(['https://example.com/', 'https://other.com/'])

    await new OpenTabsBlocker(openTabs).blockOpenTabs(['example.com'])

    expect(openTabs.redirectToBlockedSitePage).toHaveBeenCalledTimes(1)
    expect(openTabs.redirectToBlockedSitePage).toHaveBeenCalledWith(1, 'example.com')
  })

  it('skips reading the tabs when nothing is blocked', async () => {
    const openTabs = createOpenTabs(['https://example.com/'])

    await new OpenTabsBlocker(openTabs).blockOpenTabs([])

    expect(openTabs.listOpenTabs).not.toHaveBeenCalled()
  })
})
