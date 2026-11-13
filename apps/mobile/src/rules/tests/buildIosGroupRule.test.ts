import { describe, expect, it } from 'vitest'
import { buildIosGroupRule } from '../buildIosGroupRule'

const WORKDAY_WINDOW = { days: [1, 2, 3, 4, 5], start: '18:00', end: '20:00' } as const

describe('buildIosGroupRule', () => {
  it('builds an always rule with a slug target and the matching rule id', () => {
    const result = buildIosGroupRule({ groupName: ' Redes Sociais ', mode: 'always', windows: [] })
    expect(result).toEqual({
      rule: { targetType: 'iosSelection', target: 'redes-sociais', mode: 'always', windows: [] },
      ruleId: 'iosSelection~redes-sociais',
      error: null,
    })
  })

  it('keeps windows only in schedule mode', () => {
    const scheduled = buildIosGroupRule({ groupName: 'Jogos', mode: 'schedule', windows: [WORKDAY_WINDOW] })
    const always = buildIosGroupRule({ groupName: 'Jogos', mode: 'always', windows: [WORKDAY_WINDOW] })
    expect(scheduled.rule?.windows).toEqual([WORKDAY_WINDOW])
    expect(always.rule?.windows).toEqual([])
  })

  it('asks for a name', () => {
    expect(buildIosGroupRule({ groupName: '  ', mode: 'always', windows: [] }).error).toBe('no-name')
  })

  it('rejects a name without letters or numbers', () => {
    expect(buildIosGroupRule({ groupName: '!!!', mode: 'always', windows: [] }).error).toBe('invalid-name')
  })

  it('reports schedule problems', () => {
    expect(buildIosGroupRule({ groupName: 'Jogos', mode: 'schedule', windows: [] }).error).toBe('no-windows')
  })
})
