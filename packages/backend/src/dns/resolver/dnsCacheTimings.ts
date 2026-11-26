export type DnsCacheTimings = {
  readonly tokenOwnerFreshMs: number
  readonly unknownTokenFreshMs: number
  readonly userStateFreshMs: number
  readonly staleUsableMs: number
  readonly maxEntriesPerCache: number
}

export const DEFAULT_DNS_CACHE_TIMINGS: DnsCacheTimings = {
  tokenOwnerFreshMs: 60_000,
  unknownTokenFreshMs: 10_000,
  userStateFreshMs: 30_000,
  staleUsableMs: 10 * 60_000,
  maxEntriesPerCache: 5_000,
}
