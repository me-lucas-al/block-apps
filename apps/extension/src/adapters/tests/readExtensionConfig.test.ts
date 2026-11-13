import { afterEach, describe, expect, it, vi } from 'vitest'
import { readExtensionConfig } from '../readExtensionConfig'

const EXTENSION_VARIABLES = {
  VITE_API_URL: 'https://api.test',
  VITE_COGNITO_USER_POOL_ID: 'pool-test',
  VITE_COGNITO_CLIENT_ID: 'client-test',
  VITE_COGNITO_HOSTED_DOMAIN: 'auth.test',
}

describe('readExtensionConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads every value from the environment', () => {
    for (const [name, value] of Object.entries(EXTENSION_VARIABLES)) vi.stubEnv(name, value)

    expect(readExtensionConfig()).toEqual({
      apiUrl: 'https://api.test',
      cognitoUserPoolId: 'pool-test',
      cognitoClientId: 'client-test',
      cognitoHostedDomain: 'auth.test',
    })
  })

  it('fails naming the variable when one is missing', () => {
    for (const [name, value] of Object.entries(EXTENSION_VARIABLES)) vi.stubEnv(name, value)
    vi.stubEnv('VITE_API_URL', '')

    expect(() => readExtensionConfig()).toThrow('VITE_API_URL')
  })
})
