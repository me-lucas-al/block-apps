import { describe, expect, it } from 'vitest'
import { extractSearchQuery } from '../extractSearchQuery'
import { SEARCH_ENGINE_HOST_FRAGMENTS } from '../searchEngineHostFragments'

const SEARCH_URLS_ACCEPTED_BY_EXTRACTOR = [
  'https://www.google.com.br/search?q=a',
  'https://encrypted.google.com/search?q=a',
  'https://cn.bing.com/search?q=a',
  'https://html.duckduckgo.com/html/?q=a',
  'https://br.search.yahoo.com/search?p=a',
  'https://search.brave.com/search?q=a',
  'https://www.ecosia.org/search?q=a',
  'https://m.youtube.com/results?search_query=a',
  'https://yandex.com.tr/search/?text=a',
  'https://www.startpage.com/sp/search?query=a',
  'https://www.qwant.com/?q=a',
  'https://m.baidu.com/s?wd=a',
]

describe('SEARCH_ENGINE_HOST_FRAGMENTS', () => {
  it.each(SEARCH_URLS_ACCEPTED_BY_EXTRACTOR)(
    'has a fragment contained in the host of %s',
    (searchUrl) => {
      expect(extractSearchQuery(searchUrl)).toBe('a')
      const { hostname } = new URL(searchUrl)
      expect(SEARCH_ENGINE_HOST_FRAGMENTS.some((fragment) => hostname.includes(fragment))).toBe(true)
    },
  )
})
