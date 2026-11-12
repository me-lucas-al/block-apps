import { describe, expect, it } from 'vitest'
import {
  FakeTabRedirect,
  MAIN_FRAME,
  SEARCH_URL,
  createGuardOnMondayNoon,
  keywordRule,
} from './guardTestKit'

async function countRedirectionsWithAllowedWindow(start: string, end: string) {
  const tabRedirect = new FakeTabRedirect()
  const rule = keywordRule('poker', {
    mode: 'schedule',
    windows: [{ days: [1], start, end }],
  })
  await createGuardOnMondayNoon([rule], tabRedirect).blockForbiddenSearch({
    tabId: 7,
    frameId: MAIN_FRAME,
    url: SEARCH_URL,
  })
  return tabRedirect.redirections.length
}

describe('SearchNavigationGuard with schedule rules', () => {
  it('allows the search inside an allowed window', async () => {
    expect(await countRedirectionsWithAllowedWindow('11:00', '13:00')).toBe(0)
  })

  it('blocks the search outside the allowed windows', async () => {
    expect(await countRedirectionsWithAllowedWindow('18:00', '20:00')).toBe(1)
  })
})
