import { describe, expect, it } from 'vitest'
import { buildBlockRule } from '../buildBlockRule'

const window = { days: [1] as const, start: '18:00', end: '20:00' }

describe('buildBlockRule for sites', () => {
  it('normalizes the target and drops windows for always mode', () => {
    const { rule } = buildBlockRule({
      kind: 'site',
      target: 'https://www.YouTube.com/watch',
      mode: 'always',
      windows: [window],
    })
    expect(rule).toEqual({
      targetType: 'site',
      target: 'youtube.com',
      mode: 'always',
      windows: [],
    })
  })

  it('keeps windows for schedule mode', () => {
    const { rule } = buildBlockRule({
      kind: 'site',
      target: 'youtube.com',
      mode: 'schedule',
      windows: [window],
    })
    expect(rule?.windows).toEqual([window])
  })

  it('rejects invalid sites', () => {
    const { rule, error } = buildBlockRule({
      kind: 'site',
      target: 'nope',
      mode: 'always',
      windows: [],
    })
    expect(rule).toBeNull()
    expect(error).toBe('invalid-site')
  })

  it.each([
    ['no-windows', []],
    ['no-days', [{ ...window, days: [] }]],
    ['invalid-time', [{ ...window, start: '25:00' }]],
  ] as const)('rejects schedule with %s', (expected, windows) => {
    const { rule, error } = buildBlockRule({
      kind: 'site',
      target: 'youtube.com',
      mode: 'schedule',
      windows,
    })
    expect(rule).toBeNull()
    expect(error).toBe(expected)
  })
})
