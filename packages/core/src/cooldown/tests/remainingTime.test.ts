import { describe, expect, it } from 'vitest'
import { formatRemaining, remainingMinutes } from '../remainingTime'

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

describe('formatRemaining', () => {
  it.each([
    [0, '0min'],
    [45, '45min'],
    [60, '1h 0min'],
    [24 * 60, '24h 0min'],
    [23 * 60 + 59, '23h 59min'],
  ])('formats %i minutes as %s', (minutes, expected) => {
    expect(formatRemaining(inMinutes(minutes), NOW)).toBe(expected)
  })
})
