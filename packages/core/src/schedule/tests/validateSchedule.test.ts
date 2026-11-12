import { describe, expect, it } from 'vitest'
import type { TimeWindow } from '../../rules/types'
import { validateSchedule } from '../validateSchedule'

const validWindow: TimeWindow = { days: [1], start: '18:00', end: '20:00' }

describe('validateSchedule', () => {
  it('accepts always mode without windows', () => {
    expect(validateSchedule('always', [])).toBeNull()
  })

  it('accepts schedule mode with a valid window', () => {
    expect(validateSchedule('schedule', [validWindow])).toBeNull()
  })

  it('rejects schedule mode without windows', () => {
    expect(validateSchedule('schedule', [])).toBe('no-windows')
  })

  it('rejects windows without days', () => {
    expect(validateSchedule('schedule', [{ ...validWindow, days: [] }])).toBe('no-days')
  })

  it('rejects windows with malformed times', () => {
    expect(validateSchedule('schedule', [{ ...validWindow, start: '25:00' }])).toBe(
      'invalid-time',
    )
  })
})
