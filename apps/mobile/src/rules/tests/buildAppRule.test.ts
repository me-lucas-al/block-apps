import { describe, expect, it } from 'vitest'
import { buildAppRule } from '../buildAppRule'

const window = { days: [1] as const, start: '18:00', end: '20:00' }

describe('buildAppRule', () => {
  it('requires a selected app', () => {
    expect(buildAppRule({ packageName: null, mode: 'always', windows: [] }).error).toBe(
      'no-app',
    )
  })

  it('drops windows for always mode', () => {
    const { rule } = buildAppRule({
      packageName: 'com.instagram.android',
      mode: 'always',
      windows: [window],
    })
    expect(rule).toEqual({
      targetType: 'app',
      target: 'com.instagram.android',
      mode: 'always',
      windows: [],
    })
  })

  it('keeps windows for schedule mode', () => {
    const { rule } = buildAppRule({
      packageName: 'com.instagram.android',
      mode: 'schedule',
      windows: [window],
    })
    expect(rule?.windows).toEqual([window])
  })

  it('surfaces schedule validation errors', () => {
    const { error } = buildAppRule({
      packageName: 'com.instagram.android',
      mode: 'schedule',
      windows: [],
    })
    expect(error).toBe('no-windows')
  })
})
