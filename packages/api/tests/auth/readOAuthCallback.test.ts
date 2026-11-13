import { describe, expect, it } from 'vitest'
import { readOAuthCallback } from '../../src/auth/cognito/readOAuthCallback'

describe('readOAuthCallback', () => {
  it('returns the code when the state matches', () => {
    const code = readOAuthCallback('https://app.test/cb?code=abc&state=expected', 'expected')

    expect(code).toBe('abc')
  })

  it('rejects a callback with a different state', () => {
    expect(() => readOAuthCallback('https://app.test/cb?code=abc&state=forged', 'expected')).toThrow(
      'OAuth state does not match the sign in request',
    )
  })

  it('rejects a callback without state', () => {
    expect(() => readOAuthCallback('https://app.test/cb?code=abc', 'expected')).toThrow(
      'OAuth state does not match the sign in request',
    )
  })

  it('shows the provider error description', () => {
    const callbackUrl =
      'https://app.test/cb?error=access_denied&error_description=User+cancelled&state=expected'

    expect(() => readOAuthCallback(callbackUrl, 'expected')).toThrow('User cancelled')
  })

  it('falls back to the provider error code', () => {
    const callbackUrl = 'https://app.test/cb?error=access_denied&state=expected'

    expect(() => readOAuthCallback(callbackUrl, 'expected')).toThrow('access_denied')
  })

  it('checks the state before reading the provider error', () => {
    const callbackUrl = 'https://app.test/cb?error=access_denied&state=forged'

    expect(() => readOAuthCallback(callbackUrl, 'expected')).toThrow('OAuth state')
  })

  it('rejects a callback without code', () => {
    expect(() => readOAuthCallback('https://app.test/cb?state=expected', 'expected')).toThrow(
      'Authorization code missing in OAuth response',
    )
  })
})
