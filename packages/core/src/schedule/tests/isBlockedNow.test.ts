import { describe, expect, it } from 'vitest'
import type { BlockRule, TimeWindow } from '../../rules/types'
import { isBlockedNow } from '../isBlockedNow'

const MONDAY = 1
const FRIDAY = 5
const SATURDAY = 6

function at(day: number, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const base = new Date(2026, 0, 4 + day, hours, minutes)
  return base
}

function scheduledRule(windows: TimeWindow[]): BlockRule {
  return {
    id: 'rule-1',
    targetType: 'site',
    target: 'example.com',
    mode: 'schedule',
    windows,
  }
}

describe('isBlockedNow', () => {
  it('always blocks rules in always mode', () => {
    const rule: BlockRule = { ...scheduledRule([]), mode: 'always' }
    expect(isBlockedNow(rule, at(MONDAY, '12:00'))).toBe(true)
  })

  it('blocks scheduled rules without any allowed window', () => {
    expect(isBlockedNow(scheduledRule([]), at(MONDAY, '12:00'))).toBe(true)
  })

  it('allows access inside the allowed window', () => {
    const rule = scheduledRule([{ days: [MONDAY], start: '18:00', end: '20:00' }])
    expect(isBlockedNow(rule, at(MONDAY, '19:00'))).toBe(false)
  })

  it('blocks access outside the allowed window', () => {
    const rule = scheduledRule([{ days: [MONDAY], start: '18:00', end: '20:00' }])
    expect(isBlockedNow(rule, at(MONDAY, '17:59'))).toBe(true)
    expect(isBlockedNow(rule, at(MONDAY, '20:00'))).toBe(true)
  })

  it('blocks access on days not listed in the window', () => {
    const rule = scheduledRule([{ days: [MONDAY], start: '18:00', end: '20:00' }])
    expect(isBlockedNow(rule, at(FRIDAY, '19:00'))).toBe(true)
  })

  it('allows the start boundary and blocks the end boundary', () => {
    const rule = scheduledRule([{ days: [MONDAY], start: '18:00', end: '20:00' }])
    expect(isBlockedNow(rule, at(MONDAY, '18:00'))).toBe(false)
    expect(isBlockedNow(rule, at(MONDAY, '20:00'))).toBe(true)
  })

  it('allows access when any of several windows matches', () => {
    const rule = scheduledRule([
      { days: [MONDAY], start: '08:00', end: '09:00' },
      { days: [MONDAY], start: '18:00', end: '20:00' },
    ])
    expect(isBlockedNow(rule, at(MONDAY, '08:30'))).toBe(false)
    expect(isBlockedNow(rule, at(MONDAY, '12:00'))).toBe(true)
  })

  describe('window crossing midnight', () => {
    const rule = scheduledRule([{ days: [FRIDAY], start: '22:00', end: '02:00' }])

    it('allows the evening part on the listed day', () => {
      expect(isBlockedNow(rule, at(FRIDAY, '23:00'))).toBe(false)
    })

    it('allows the morning part on the following day', () => {
      expect(isBlockedNow(rule, at(SATURDAY, '01:00'))).toBe(false)
    })

    it('blocks the morning part on the listed day itself', () => {
      expect(isBlockedNow(rule, at(FRIDAY, '01:00'))).toBe(true)
    })

    it('blocks after the window ends on the following day', () => {
      expect(isBlockedNow(rule, at(SATURDAY, '02:00'))).toBe(true)
    })

    it('wraps from Saturday to Sunday', () => {
      const weekendRule = scheduledRule([
        { days: [SATURDAY], start: '23:00', end: '01:00' },
      ])
      expect(isBlockedNow(weekendRule, at(0, '00:30'))).toBe(false)
    })
  })

  it('treats a zero length window as never allowed', () => {
    const rule = scheduledRule([{ days: [MONDAY], start: '10:00', end: '10:00' }])
    expect(isBlockedNow(rule, at(MONDAY, '10:00'))).toBe(true)
  })
})
