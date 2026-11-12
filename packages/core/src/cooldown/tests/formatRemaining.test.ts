import { describe, expect, it } from 'vitest'
import { formatRemaining } from '../formatRemaining'

const NOW = new Date('2026-01-05T12:00:00.000Z')

function inMinutes(minutes: number): string {
  return new Date(NOW.getTime() + minutes * 60_000).toISOString()
}

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
