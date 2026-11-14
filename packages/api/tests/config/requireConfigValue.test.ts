import { describe, expect, it } from 'vitest'
import { requireConfigValue } from '../../src/config/requireConfigValue'

describe('requireConfigValue', () => {
  it('returns the configured value', () => {
    expect(requireConfigValue('VITE_API_URL', 'https://api.test')).toBe('https://api.test')
  })

  it('throws naming the missing variable when undefined', () => {
    expect(() => requireConfigValue('VITE_API_URL', undefined)).toThrow(
      'Missing client configuration: VITE_API_URL',
    )
  })

  it('throws when the value is an empty string', () => {
    expect(() => requireConfigValue('VITE_API_URL', '')).toThrow('VITE_API_URL')
  })
})
