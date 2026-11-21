import { describe, expect, it } from 'vitest'
import { ValidationError } from '../../../src/domain/errors/ValidationError'
import { canonicalizeTimeZone } from '../../../src/dns/time-zone/canonicalizeTimeZone'

describe('canonicalizeTimeZone', () => {
  it.each([
    ['utc', 'UTC'],
    ['UTC', 'UTC'],
    ['Etc/UTC', 'UTC'],
    ['america/sao_paulo', 'America/Sao_Paulo'],
    ['US/Pacific', 'America/Los_Angeles'],
  ])('turns %s into %s', (requestedTimeZone, canonicalName) => {
    expect(canonicalizeTimeZone(requestedTimeZone)).toBe(canonicalName)
  })

  it('accepts a legacy alias and settles on a name that is stable', () => {
    const canonicalName = canonicalizeTimeZone('Asia/Calcutta')
    expect(['Asia/Calcutta', 'Asia/Kolkata']).toContain(canonicalName)
    expect(canonicalizeTimeZone(canonicalName)).toBe(canonicalName)
  })

  it.each([
    ['GMT', 'GMT'],
    ['EST', 'EST'],
    ['a fixed offset', '+03:00'],
    ['an unknown area', 'Mars/Olympus'],
    ['a long text', `America/${'x'.repeat(5000)}`],
    ['a long text without area', 'y'.repeat(5000)],
    ['an empty text', ''],
  ])('rejects %s', (_label, requestedTimeZone) => {
    expect(() => canonicalizeTimeZone(requestedTimeZone)).toThrow(ValidationError)
  })
})
