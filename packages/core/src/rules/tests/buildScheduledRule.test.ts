import { describe, expect, it } from 'vitest'
import type { TimeWindow } from '../blockRule'
import { buildScheduledRule } from '../buildScheduledRule'

const eveningWindow: TimeWindow = { days: [1, 2], start: '18:00', end: '20:00' }

describe('buildScheduledRule', () => {
  it('drops windows when the rule is always blocked', () => {
    expect(buildScheduledRule('site', 'example.com', 'always', [eveningWindow])).toEqual({
      rule: { targetType: 'site', target: 'example.com', mode: 'always', windows: [] },
      error: null,
    })
  })

  it('keeps windows for schedule mode', () => {
    expect(buildScheduledRule('keyword', 'aposta', 'schedule', [eveningWindow])).toEqual({
      rule: { targetType: 'keyword', target: 'aposta', mode: 'schedule', windows: [eveningWindow] },
      error: null,
    })
  })

  it('reports the schedule error instead of building the rule', () => {
    expect(buildScheduledRule('app', 'com.x.y', 'schedule', [])).toEqual({
      rule: null,
      error: 'no-windows',
    })
  })
})
