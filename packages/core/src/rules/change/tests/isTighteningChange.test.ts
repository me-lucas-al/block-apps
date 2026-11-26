import { describe, expect, it } from 'vitest'
import type { TimeWindow } from '../../blockRule'
import { isTighteningChange, type RuleSchedule } from '../isTighteningChange'

const MONDAY = 1
const TUESDAY = 2

const alwaysBlocked: RuleSchedule = { mode: 'always', windows: [] }

function scheduled(...windows: TimeWindow[]): RuleSchedule {
  return { mode: 'schedule', windows }
}

const workdayHours: TimeWindow = { days: [MONDAY], start: '09:00', end: '17:00' }

describe('isTighteningChange', () => {
  it('tightens when a schedule becomes always blocked', () => {
    expect(isTighteningChange(scheduled(workdayHours), alwaysBlocked)).toBe(true)
  })

  it('loosens when always blocked becomes a schedule', () => {
    expect(isTighteningChange(alwaysBlocked, scheduled(workdayHours))).toBe(false)
  })

  it('tightens when always blocked is requested again', () => {
    expect(isTighteningChange(alwaysBlocked, alwaysBlocked)).toBe(true)
  })

  it('tightens when the new window is shorter and inside the old one', () => {
    const requested = scheduled({ days: [MONDAY], start: '10:00', end: '16:00' })
    expect(isTighteningChange(scheduled(workdayHours), requested)).toBe(true)
  })

  it('tightens when a day is dropped from the window', () => {
    const current = scheduled({ days: [MONDAY, TUESDAY], start: '09:00', end: '17:00' })
    expect(isTighteningChange(current, scheduled(workdayHours))).toBe(true)
  })

  it('tightens when every window is removed', () => {
    expect(isTighteningChange(scheduled(workdayHours), scheduled())).toBe(true)
  })

  it('tightens when the new window sits inside the union of several old windows', () => {
    const current = scheduled(
      { days: [MONDAY], start: '09:00', end: '12:00' },
      { days: [MONDAY], start: '12:00', end: '17:00' },
    )
    const requested = scheduled({ days: [MONDAY], start: '11:00', end: '13:00' })
    expect(isTighteningChange(current, requested)).toBe(true)
  })

  it('loosens when the new window is longer', () => {
    const current = scheduled({ days: [MONDAY], start: '10:00', end: '16:00' })
    expect(isTighteningChange(current, scheduled(workdayHours))).toBe(false)
  })

  it('loosens when the end moves one minute later', () => {
    const requested = scheduled({ days: [MONDAY], start: '09:00', end: '17:01' })
    expect(isTighteningChange(scheduled(workdayHours), requested)).toBe(false)
  })

  it('loosens when a window is added on another day', () => {
    const requested = scheduled({ days: [MONDAY, TUESDAY], start: '09:00', end: '17:00' })
    expect(isTighteningChange(scheduled(workdayHours), requested)).toBe(false)
  })

  it('loosens when the window moves to a different day', () => {
    const requested = scheduled({ days: [TUESDAY], start: '09:00', end: '17:00' })
    expect(isTighteningChange(scheduled(workdayHours), requested)).toBe(false)
  })

  it('counts a mixed change as loosening', () => {
    const requested = scheduled(
      { days: [MONDAY], start: '10:00', end: '12:00' },
      { days: [TUESDAY], start: '10:00', end: '12:00' },
    )
    expect(isTighteningChange(scheduled(workdayHours), requested)).toBe(false)
  })

  it('ignores zero length windows in the request', () => {
    const requested = scheduled({ days: [TUESDAY], start: '10:00', end: '10:00' })
    expect(isTighteningChange(scheduled(workdayHours), requested)).toBe(true)
  })
})
