import { describe, expect, it } from 'vitest'
import { parseBrowserTarget } from '../browserTarget'

describe('parseBrowserTarget', () => {
  it('defaults to chrome when nothing is set', () => {
    expect(parseBrowserTarget(undefined)).toBe('chrome')
    expect(parseBrowserTarget('')).toBe('chrome')
  })

  it('accepts chrome and firefox', () => {
    expect(parseBrowserTarget('chrome')).toBe('chrome')
    expect(parseBrowserTarget('firefox')).toBe('firefox')
  })

  it('rejects unknown targets', () => {
    expect(() => parseBrowserTarget('safari')).toThrow('Unknown browser target "safari"')
  })
})
