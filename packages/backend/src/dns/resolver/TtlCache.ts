type CacheEntry<CachedContent> = {
  readonly cachedContent: CachedContent
  readonly expiresAt: number
}

export class TtlCache<CachedContent> {
  private readonly entries = new Map<string, CacheEntry<CachedContent>>()

  constructor(private readonly ttlMs: number) {}

  readFresh(key: string, nowMs: number): CachedContent | undefined {
    const entry = this.entries.get(key)
    if (!entry || entry.expiresAt <= nowMs) return undefined
    return entry.cachedContent
  }

  readStale(key: string): CachedContent | undefined {
    return this.entries.get(key)?.cachedContent
  }

  write(key: string, cachedContent: CachedContent, nowMs: number): void {
    this.entries.set(key, { cachedContent, expiresAt: nowMs + this.ttlMs })
  }
}
