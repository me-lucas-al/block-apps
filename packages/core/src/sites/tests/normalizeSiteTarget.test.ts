import { describe, expect, it } from 'vitest'
import { normalizeSiteTarget } from '../normalizeSiteTarget'

describe('normalizeSiteTarget', () => {
  it.each([
    ['example.com', 'example.com'],
    ['  Example.COM ', 'example.com'],
    ['https://www.example.com/path?q=1', 'example.com'],
    ['http://sub.example.com', 'sub.example.com'],
    ['www.youtube.com/watch?v=1', 'youtube.com'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeSiteTarget(input)).toBe(expected)
  })

  it.each(['', '   ', 'localhost', 'not a site', 'http://', 'foo..com', '.com'])(
    'rejects %j',
    (input) => {
      expect(normalizeSiteTarget(input)).toBeNull()
    },
  )
})
