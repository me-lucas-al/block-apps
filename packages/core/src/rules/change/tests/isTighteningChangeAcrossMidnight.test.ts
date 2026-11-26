import { describe, expect, it } from 'vitest'
import type { TimeWindow } from '../../blockRule'
import { isTighteningChange, type RuleSchedule } from '../isTighteningChange'

const SUNDAY = 0
const FRIDAY = 5
const SATURDAY = 6

function scheduled(...windows: TimeWindow[]): RuleSchedule {
  return { mode: 'schedule', windows }
}

describe('isTighteningChange with windows that cross midnight', () => {
  const fridayNight = scheduled({ days: [FRIDAY], start: '22:00', end: '02:00' })

  it('tightens to a shorter window that also crosses midnight', () => {
    const requested = scheduled({ days: [FRIDAY], start: '23:00', end: '01:00' })
    expect(isTighteningChange(fridayNight, requested)).toBe(true)
  })

  it('tightens to the evening part only', () => {
    const requested = scheduled({ days: [FRIDAY], start: '22:00', end: '23:59' })
    expect(isTighteningChange(fridayNight, requested)).toBe(true)
  })

  it('tightens to the two parts written as separate windows', () => {
    const requested = scheduled(
      { days: [FRIDAY], start: '22:00', end: '23:59' },
      { days: [SATURDAY], start: '00:00', end: '02:00' },
    )
    expect(isTighteningChange(fridayNight, requested)).toBe(true)
  })

  it('loosens when the morning part lands on the day before the old window', () => {
    const requested = scheduled({ days: [FRIDAY], start: '00:00', end: '02:00' })
    expect(isTighteningChange(fridayNight, requested)).toBe(false)
  })

  it('loosens when the window grows past the old end', () => {
    const requested = scheduled({ days: [FRIDAY], start: '22:00', end: '03:00' })
    expect(isTighteningChange(fridayNight, requested)).toBe(false)
  })

  it('tightens a Saturday to Sunday window that wraps the week', () => {
    const current = scheduled({ days: [SATURDAY], start: '23:00', end: '01:00' })
    const requested = scheduled({ days: [SUNDAY], start: '00:00', end: '00:30' })
    expect(isTighteningChange(current, requested)).toBe(true)
  })
})
