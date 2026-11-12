import { SEARCH_ENGINES } from './searchEngines'

export const SEARCH_ENGINE_HOST_FRAGMENTS: readonly string[] = SEARCH_ENGINES.map(
  (engine) => engine.hostFragment,
)
