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

function readFirstFilledParameter(url: URL, names: readonly string[]): string | null {
  for (const name of names) {
    const queryText = url.searchParams.get(name)?.trim()
    if (queryText) return queryText
  }
  return null
}

export function extractSearchQuery(candidateUrl: string): string | null {
  const url = parseWebUrl(candidateUrl)
  if (!url) return null

  const engine = SEARCH_ENGINES.find((searchEngine) => isSearchPageOf(searchEngine, url))
  if (!engine) return null

  return readFirstFilledParameter(url, engine.queryParameters)
}
