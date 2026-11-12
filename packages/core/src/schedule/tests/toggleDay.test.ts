import { describe, expect, it } from 'vitest'
import { toggleDay } from '../toggleDay'

describe('toggleDay', () => {
  it('adds a missing day keeping days sorted', () => {
    expect(toggleDay([1, 5], 3)).toEqual([1, 3, 5])
  })

  it('removes a present day', () => {
    expect(toggleDay([1, 3, 5], 3)).toEqual([1, 5])
  })

  it('does not mutate the input', () => {
    const days = [1] as const
    toggleDay(days, 2)
    expect(days).toEqual([1])
  })
})
