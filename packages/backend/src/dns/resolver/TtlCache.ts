type CacheEntry<CachedContent> = {
  readonly cachedContent: CachedContent
  readonly writtenAtMs: number
}

export type TtlCacheLimits = {
  readonly freshForMs: number
  readonly usableWhenStaleForMs: number
  readonly maxEntries: number
}

export class TtlCache<CachedContent> {
  private readonly entries = new Map<string, CacheEntry<CachedContent>>()

  constructor(private readonly limits: TtlCacheLimits) {}

  readFresh(key: string, nowMs: number): CachedContent | undefined {
    const entry = this.entries.get(key)
    if (!entry || nowMs - entry.writtenAtMs >= this.limits.freshForMs) return undefined
    return entry.cachedContent
  }

  readStale(key: string, nowMs: number): CachedContent | undefined {
    const entry = this.entries.get(key)
    if (!entry || nowMs - entry.writtenAtMs > this.limits.usableWhenStaleForMs) return undefined
    return entry.cachedContent
  }

  write(key: string, cachedContent: CachedContent, nowMs: number): void {
    this.entries.delete(key)
    if (this.entries.size >= this.limits.maxEntries) this.evictOldestEntry()
    this.entries.set(key, { cachedContent, writtenAtMs: nowMs })
  }

  private evictOldestEntry(): void {
    const oldestKey = this.entries.keys().next().value
    if (oldestKey !== undefined) this.entries.delete(oldestKey)
  }
}
