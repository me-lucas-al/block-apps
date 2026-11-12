import { describe, expect, it } from 'vitest'
import { findBlockedKeyword } from '../findBlockedKeyword'
import { matchesBlockedKeyword } from '../matchesBlockedKeyword'

describe('matchesBlockedKeyword', () => {
  it.each([
    ['poker', ['poker']],
    ['POKER online', ['poker']],
    ['melhores sites de apostas', ['apostas']],
    ['sessão de ação', ['sessao de acao']],
    ['Sessao   de   Acao', ['sessão de ação']],
    ['how to play poker, fast!', ['poker']],
    ['jogo do tigrinho', ['tigrinho', 'cassino']],
  ])('blocks %j for %j', (searchQuery, keywords) => {
    expect(matchesBlockedKeyword(searchQuery, keywords)).toBe(true)
  })

  it.each([
    ['pokerface lyrics', ['poker']],
    ['sex education', ['sexo']],
    ['assess my class', ['ass']],
    ['carro novo', ['car']],
    ['jogo do tigre', ['tigrinho']],
    ['poker', []],
    ['', ['poker']],
    ['poker', ['']],
    ['poker', ['   ', '!!!']],
  ])('allows %j for %j', (searchQuery, keywords) => {
    expect(matchesBlockedKeyword(searchQuery, keywords)).toBe(false)
  })

  it('matches multi-word phrases only as a whole phrase', () => {
    expect(matchesBlockedKeyword('apostas esportivas hoje', ['apostas esportivas'])).toBe(true)
    expect(matchesBlockedKeyword('esportivas apostas', ['apostas esportivas'])).toBe(false)
  })
})

describe('findBlockedKeyword', () => {
  it('returns the keyword as registered', () => {
    expect(findBlockedKeyword('ver Cassino online', ['poker', 'cassino'])).toBe('cassino')
  })

  it('returns null when nothing matches', () => {
    expect(findBlockedKeyword('receita de bolo', ['poker'])).toBeNull()
  })
})
