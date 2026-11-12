import { describe, expect, it } from 'vitest'
import { extractSearchQuery } from '../extractSearchQuery'
import { SEARCH_ENGINE_HOST_FRAGMENTS } from '../searchEngineHostFragments'

describe('extractSearchQuery', () => {
  it.each([
    ['https://www.google.com/search?q=poker+online&hl=pt', 'poker online'],
    ['https://www.google.com.br/search?q=apostas%20esportivas', 'apostas esportivas'],
    ['https://google.de/search?q=casino', 'casino'],
    ['https://www.bing.com/search?q=poker&form=QBLH', 'poker'],
    ['https://duckduckgo.com/?q=poker&ia=web', 'poker'],
    ['https://html.duckduckgo.com/html/?q=poker', 'poker'],
    ['https://search.yahoo.com/search?p=poker', 'poker'],
    ['https://br.search.yahoo.com/search?p=poker+online', 'poker online'],
    ['https://search.brave.com/search?q=poker', 'poker'],
    ['https://www.ecosia.org/search?q=poker', 'poker'],
    ['https://www.youtube.com/results?search_query=poker+tutorial', 'poker tutorial'],
    ['https://m.youtube.com/results?search_query=poker', 'poker'],
    ['https://yandex.com/search/?text=poker', 'poker'],
    ['https://www.startpage.com/sp/search?query=poker', 'poker'],
    ['https://www.qwant.com/?q=poker', 'poker'],
    ['https://www.baidu.com/s?wd=poker', 'poker'],
  ])('extracts the query from %s', (url, expected) => {
    expect(extractSearchQuery(url)).toBe(expected)
  })

  it.each([
    'https://www.google.com/',
    'https://www.google.com/search',
    'https://www.google.com/search?q=',
    'https://www.google.com/search?q=%20%20',
    'https://www.google.com/url?q=https://example.com',
    'https://www.youtube.com/watch?v=abc&q=poker',
    'https://example.com/search?q=poker',
    'https://notgoogle.com/search?q=poker',
    'https://google.com.evil.com/search?q=poker',
    'ftp://www.google.com/search?q=poker',
    'chrome://extensions',
    'not a url',
    '',
  ])('returns null for %j', (url) => {
    expect(extractSearchQuery(url)).toBeNull()
  })
})

describe('SEARCH_ENGINE_HOST_FRAGMENTS', () => {
  it('lists a fragment for each engine', () => {
    expect(SEARCH_ENGINE_HOST_FRAGMENTS).toContain('google.')
    expect(SEARCH_ENGINE_HOST_FRAGMENTS).toContain('youtube.com')
  })
})
