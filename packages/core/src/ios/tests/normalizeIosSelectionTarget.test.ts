import { describe, expect, it } from 'vitest'
import { normalizeIosSelectionTarget } from '../normalizeIosSelectionTarget'

describe('normalizeIosSelectionTarget', () => {
  it.each([
    ['Redes Sociais', 'redes-sociais'],
    ['  Jogos  ', 'jogos'],
    ['Sessão de Ação', 'sessao-de-acao'],
    ['Vídeo, Streaming!', 'video-streaming'],
    ['Grupo 2', 'grupo-2'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeIosSelectionTarget(input)).toBe(expected)
  })

  it.each(['', '   ', '!!!', '---'])('rejects %j', (input) => {
    expect(normalizeIosSelectionTarget(input)).toBeNull()
  })

  it('rejects names longer than 50 characters', () => {
    expect(normalizeIosSelectionTarget('a'.repeat(51))).toBeNull()
    expect(normalizeIosSelectionTarget('a'.repeat(50))).toBe('a'.repeat(50))
  })
})
