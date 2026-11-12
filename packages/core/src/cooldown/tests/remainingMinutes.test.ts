import { describe, expect, it } from 'vitest'
import { remainingMinutes } from '../remainingMinutes'

const NOW = new Date('2026-01-05T12:00:00.000Z')

function inMinutes(minutes: number): string {
  return new Date(NOW.getTime() + minutes * 60_000).toISOString()
}

describe('remainingMinutes', () => {
  it('rounds partial minutes up', () => {
    const effectiveAt = new Date(NOW.getTime() + 61_000).toISOString()
    expect(remainingMinutes(effectiveAt, NOW)).toBe(2)
  })

  it('is zero for an invalid date instead of NaN', () => {
    expect(remainingMinutes('not a date', NOW)).toBe(0)
  })

  it('is zero once the change is due', () => {
    expect(remainingMinutes(inMinutes(0), NOW)).toBe(0)
    expect(remainingMinutes(inMinutes(-30), NOW)).toBe(0)
  })
})
