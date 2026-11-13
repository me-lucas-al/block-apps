import { afterEach, describe, expect, it, vi } from 'vitest'
import { readMobileConfig } from '../readMobileConfig'

const MOBILE_VARIABLES = {
  EXPO_PUBLIC_API_URL: 'https://api.test',
  EXPO_PUBLIC_COGNITO_USER_POOL_ID: 'pool-test',
  EXPO_PUBLIC_COGNITO_CLIENT_ID: 'client-test',
  EXPO_PUBLIC_COGNITO_HOSTED_DOMAIN: 'auth.test',
}

describe('readMobileConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads every value from the environment', () => {
    for (const [name, value] of Object.entries(MOBILE_VARIABLES)) vi.stubEnv(name, value)

    expect(readMobileConfig()).toEqual({
      apiUrl: 'https://api.test',
      cognitoUserPoolId: 'pool-test',
      cognitoClientId: 'client-test',
      cognitoHostedDomain: 'auth.test',
    })
  })

  it('fails naming the variable when one is missing', () => {
    for (const [name, value] of Object.entries(MOBILE_VARIABLES)) vi.stubEnv(name, value)
    vi.stubEnv('EXPO_PUBLIC_COGNITO_USER_POOL_ID', '')

    expect(() => readMobileConfig()).toThrow('EXPO_PUBLIC_COGNITO_USER_POOL_ID')
  })
})
