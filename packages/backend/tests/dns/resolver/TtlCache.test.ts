import { describe, expect, it } from 'vitest'
import { TtlCache } from '../../../src/dns/resolver/TtlCache'

const limits = { freshForMs: 1_000, usableWhenStaleForMs: 5_000, maxEntries: 2 }

describe('TtlCache', () => {
  it('serves fresh content only inside the fresh window', () => {
    const cache = new TtlCache<string>(limits)
    cache.write('key', 'cached', 0)

    expect(cache.readFresh('key', 999)).toBe('cached')
    expect(cache.readFresh('key', 1_000)).toBeUndefined()
  })

  it('serves stale content only until the maximum stale age', () => {
    const cache = new TtlCache<string>(limits)
    cache.write('key', 'cached', 0)

    expect(cache.readStale('key', 5_000)).toBe('cached')
    expect(cache.readStale('key', 5_001)).toBeUndefined()
  })

  it('evicts the oldest entry when the cache is full', () => {
    const cache = new TtlCache<string>(limits)
    cache.write('first', '1', 0)
    cache.write('second', '2', 0)
    cache.write('third', '3', 0)

    expect(cache.readFresh('first', 1)).toBeUndefined()
    expect(cache.readFresh('second', 1)).toBe('2')
    expect(cache.readFresh('third', 1)).toBe('3')
  })
})
