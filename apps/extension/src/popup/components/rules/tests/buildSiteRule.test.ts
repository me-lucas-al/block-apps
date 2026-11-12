import { describe, expect, it } from 'vitest'
import { buildSiteRule } from '../buildSiteRule'

const window = { days: [1] as const, start: '18:00', end: '20:00' }

describe('buildSiteRule', () => {
  it('normalizes the target and drops windows for always mode', () => {
    const { rule } = buildSiteRule({
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
    const { rule } = buildSiteRule({
      target: 'youtube.com',
      mode: 'schedule',
      windows: [window],
    })
    expect(rule?.windows).toEqual([window])
  })

  it('rejects invalid sites', () => {
    const { rule, error } = buildSiteRule({ target: 'nope', mode: 'always', windows: [] })
    expect(rule).toBeNull()
    expect(error).toMatch(/site válido/)
  })

  it('rejects schedule mode without windows', () => {
    const { rule, error } = buildSiteRule({
      target: 'youtube.com',
      mode: 'schedule',
      windows: [],
    })
    expect(rule).toBeNull()
    expect(error).toMatch(/horário/)
  })
})
