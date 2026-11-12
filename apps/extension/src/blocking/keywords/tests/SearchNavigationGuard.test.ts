import { describe, expect, it } from 'vitest'
import {
  FakeTabRedirect,
  MAIN_FRAME,
  SEARCH_URL,
  createGuardOnMondayNoon,
  keywordRule,
} from './guardTestKit'

async function guardNavigation(
  navigation: { tabId?: number; frameId?: number; url?: string },
  rules = [keywordRule('poker')],
) {
  const tabRedirect = new FakeTabRedirect()
  await createGuardOnMondayNoon(rules, tabRedirect).blockForbiddenSearch({
    tabId: 7,
    frameId: MAIN_FRAME,
    url: SEARCH_URL,
    ...navigation,
  })
  return tabRedirect.redirections
}

describe('SearchNavigationGuard', () => {
  it('redirects the tab when the search contains a blocked keyword', async () => {
    expect(await guardNavigation({})).toEqual([{ tabId: 7, blockedKeyword: 'poker' }])
  })

  it('leaves searches without blocked keywords alone', async () => {
    expect(await guardNavigation({}, [keywordRule('cassino')])).toEqual([])
  })

  it('ignores navigations that are not searches', async () => {
    expect(await guardNavigation({ url: 'https://example.com/poker' })).toEqual([])
  })

  it('ignores subframe navigations', async () => {
    expect(await guardNavigation({ frameId: 3 })).toEqual([])
  })

  it('ignores navigations without a real tab', async () => {
    expect(await guardNavigation({ tabId: -1 })).toEqual([])
  })

  it('ignores site and app rules', async () => {
    const rules = [
      keywordRule('poker', { targetType: 'site' }),
      keywordRule('poker', { targetType: 'app' }),
    ]
    expect(await guardNavigation({}, rules)).toEqual([])
  })
})
