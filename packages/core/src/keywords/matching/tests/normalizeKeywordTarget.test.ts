import { describe, expect, it } from 'vitest'
import { normalizeKeywordTarget } from '../normalizeKeywordTarget'

describe('normalizeKeywordTarget', () => {
  it.each([
    ['poker', 'poker'],
    ['  Poker  ', 'poker'],
    ['Sessão de Ação', 'sessao de acao'],
    ['jogo,   do---tigrinho!', 'jogo do tigrinho'],
    ['Apostas 2026', 'apostas 2026'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeKeywordTarget(input)).toBe(expected)
  })

  it.each(['', '   ', '!!!', '---'])('rejects %j', (input) => {
    expect(normalizeKeywordTarget(input)).toBeNull()
  })

  it('rejects keywords longer than 100 characters', () => {
    expect(normalizeKeywordTarget('a'.repeat(101))).toBeNull()
    expect(normalizeKeywordTarget('a'.repeat(100))).not.toBeNull()
  })
})
