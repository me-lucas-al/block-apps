import { describe, expect, it } from 'vitest'
import { buildKeywordRule } from '../buildKeywordRule'

const weekdayEvening = { days: [1, 2] as const, start: '18:00', end: '20:00' }

describe('buildKeywordRule', () => {
  it.each(['', '   ', '!!!', 'a'.repeat(101)])('rejects %j as a keyword', (keyword) => {
    expect(buildKeywordRule({ keyword, mode: 'always', windows: [] }).error).toBe(
      'invalid-keyword',
    )
  })

  it('normalizes the phrase and drops windows for always mode', () => {
    const { rule } = buildKeywordRule({
      keyword: '  Pôquer   Online ',
      mode: 'always',
      windows: [weekdayEvening],
    })
    expect(rule).toEqual({
      targetType: 'keyword',
      target: 'poquer online',
      mode: 'always',
      windows: [],
    })
  })

  it('keeps windows for schedule mode', () => {
    const { rule } = buildKeywordRule({
      keyword: 'aposta',
      mode: 'schedule',
      windows: [weekdayEvening],
    })
    expect(rule).toEqual({
      targetType: 'keyword',
      target: 'aposta',
      mode: 'schedule',
      windows: [weekdayEvening],
    })
  })

  it('requires a window in schedule mode', () => {
    expect(buildKeywordRule({ keyword: 'aposta', mode: 'schedule', windows: [] }).error).toBe(
      'no-windows',
    )
  })
})
