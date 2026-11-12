import { SEARCH_ENGINES, type SearchEngine } from './searchEngines'

function parseWebUrl(candidateUrl: string): URL | null {
  try {
    const parsed = new URL(candidateUrl)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed : null
  } catch {
    return null
  }
}

function isSearchPageOf(engine: SearchEngine, url: URL): boolean {
  return engine.hostPattern.test(url.hostname) && engine.pathPattern.test(url.pathname)
}

function readAllQueryTexts(url: URL, names: readonly string[]): string | null {
  const queryTexts = names
    .flatMap((name) => url.searchParams.getAll(name))
    .map((queryText) => queryText.trim())
    .filter((queryText) => queryText !== '')
  return queryTexts.length > 0 ? queryTexts.join(' ') : null
}

export function extractSearchQuery(candidateUrl: string): string | null {
  const url = parseWebUrl(candidateUrl)
  if (!url) return null

  const engine = SEARCH_ENGINES.find((searchEngine) => isSearchPageOf(searchEngine, url))
  if (!engine) return null

  return readAllQueryTexts(url, engine.queryParameters)
}
