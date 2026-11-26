import { describe, expect, it } from 'vitest'
import { buildAllowedMinutesOfWeek } from '../buildAllowedMinutesOfWeek'

const MINUTES_PER_DAY = 1440
const SUNDAY = 0
const MONDAY = 1
const SATURDAY = 6

function countAllowed(allowedMinutes: boolean[]): number {
  return allowedMinutes.filter(Boolean).length
}

describe('buildAllowedMinutesOfWeek', () => {
  it('covers every minute of the week', () => {
    expect(buildAllowedMinutesOfWeek([])).toHaveLength(7 * MINUTES_PER_DAY)
  })

  it('allows nothing without windows', () => {
    expect(countAllowed(buildAllowedMinutesOfWeek([]))).toBe(0)
  })

  it('marks the start minute and leaves the end minute blocked', () => {
    const allowed = buildAllowedMinutesOfWeek([{ days: [MONDAY], start: '18:00', end: '20:00' }])
    const mondayStart = MONDAY * MINUTES_PER_DAY
    expect(allowed[mondayStart + 17 * 60 + 59]).toBe(false)
    expect(allowed[mondayStart + 18 * 60]).toBe(true)
    expect(allowed[mondayStart + 19 * 60 + 59]).toBe(true)
    expect(allowed[mondayStart + 20 * 60]).toBe(false)
    expect(countAllowed(allowed)).toBe(120)
  })

  it('repeats the window on every listed day', () => {
    const allowed = buildAllowedMinutesOfWeek([{ days: [MONDAY, SATURDAY], start: '10:00', end: '11:00' }])
    expect(allowed[SATURDAY * MINUTES_PER_DAY + 10 * 60]).toBe(true)
    expect(countAllowed(allowed)).toBe(120)
  })

  it('spills a window that crosses midnight into the next day', () => {
    const allowed = buildAllowedMinutesOfWeek([{ days: [MONDAY], start: '22:00', end: '02:00' }])
    expect(allowed[MONDAY * MINUTES_PER_DAY + 22 * 60]).toBe(true)
    expect(allowed[2 * MINUTES_PER_DAY + 60 + 59]).toBe(true)
    expect(allowed[2 * MINUTES_PER_DAY + 2 * 60]).toBe(false)
    expect(allowed[MONDAY * MINUTES_PER_DAY + 60]).toBe(false)
    expect(countAllowed(allowed)).toBe(240)
  })

  it('wraps a Saturday night window into Sunday morning', () => {
    const allowed = buildAllowedMinutesOfWeek([{ days: [SATURDAY], start: '23:00', end: '01:00' }])
    expect(allowed[SUNDAY * MINUTES_PER_DAY + 30]).toBe(true)
    expect(allowed[SUNDAY * MINUTES_PER_DAY + 60]).toBe(false)
  })

  it('ignores zero length windows', () => {
    const allowed = buildAllowedMinutesOfWeek([{ days: [MONDAY], start: '10:00', end: '10:00' }])
    expect(countAllowed(allowed)).toBe(0)
  })
})
