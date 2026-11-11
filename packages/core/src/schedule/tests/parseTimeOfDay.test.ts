import { describe, expect, it } from 'vitest'
import { parseTimeOfDay } from '../parseTimeOfDay'

describe('parseTimeOfDay', () => {
  it('converts HH:mm into minutes since midnight', () => {
    expect(parseTimeOfDay('00:00')).toBe(0)
    expect(parseTimeOfDay('08:30')).toBe(510)
    expect(parseTimeOfDay('23:59')).toBe(1439)
  })

  it.each(['24:00', '12:60', '8:30', '08:3', 'abc', ''])(
    'rejects %s',
    (invalid) => {
      expect(() => parseTimeOfDay(invalid)).toThrow(RangeError)
    },
  )
})
