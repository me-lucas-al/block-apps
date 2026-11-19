type CacheEntry<Value> = {
  readonly value: Value
  readonly expiresAt: number
}

export class TtlCache<Value> {
  private readonly entries = new Map<string, CacheEntry<Value>>()

  constructor(private readonly ttlMs: number) {}

  readFresh(key: string, nowMs: number): Value | undefined {
    const entry = this.entries.get(key)
    if (!entry || entry.expiresAt <= nowMs) return undefined
    return entry.value
  }

  readStale(key: string): Value | undefined {
    return this.entries.get(key)?.value
  }

  write(key: string, value: Value, nowMs: number): void {
    this.entries.set(key, { value, expiresAt: nowMs + this.ttlMs })
  }
}
