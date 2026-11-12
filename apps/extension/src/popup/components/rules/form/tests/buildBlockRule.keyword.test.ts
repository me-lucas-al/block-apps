import { describe, expect, it } from 'vitest'
import { buildBlockRule } from '../buildBlockRule'

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
