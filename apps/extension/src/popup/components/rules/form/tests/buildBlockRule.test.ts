import { describe, expect, it } from 'vitest'
import { buildBlockRule } from '../buildBlockRule'
import { ruleErrorMessage } from '../ruleErrorMessage'

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

describe('buildBlockRule for keywords', () => {
  it('normalizes the keyword', () => {
    const { rule } = buildBlockRule({
      kind: 'keyword',
      target: '  Jogo do TIGRINHO! ',
      mode: 'always',
      windows: [],
    })
    expect(rule).toEqual({
      targetType: 'keyword',
      target: 'jogo do tigrinho',
      mode: 'always',
      windows: [],
    })
  })

  it('rejects keywords without letters or digits', () => {
    const { rule, error } = buildBlockRule({
      kind: 'keyword',
      target: '!!!',
      mode: 'always',
      windows: [],
    })
    expect(rule).toBeNull()
    expect(error).toBe('invalid-keyword')
  })

  it('applies the same schedule validation', () => {
    const { error } = buildBlockRule({
      kind: 'keyword',
      target: 'poker',
      mode: 'schedule',
      windows: [],
    })
    expect(error).toBe('no-windows')
  })
})

describe('ruleErrorMessage', () => {
  it('has a message for every error', () => {
    for (const error of [
      'invalid-site',
      'invalid-keyword',
      'no-windows',
      'no-days',
      'invalid-time',
    ] as const) {
      expect(ruleErrorMessage(error).length).toBeGreaterThan(0)
    }
  })
})
