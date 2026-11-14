import { afterEach, describe, expect, it, vi } from 'vitest'
import { readAdminConfig } from '../readAdminConfig'

const ADMIN_VARIABLES = {
  VITE_API_URL: 'https://api.test',
  VITE_COGNITO_USER_POOL_ID: 'pool-test',
  VITE_COGNITO_CLIENT_ID: 'client-test',
  VITE_COGNITO_HOSTED_DOMAIN: 'auth.test',
}

describe('readAdminConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads every value from the environment', () => {
    for (const [name, value] of Object.entries(ADMIN_VARIABLES)) vi.stubEnv(name, value)

    expect(readAdminConfig()).toEqual({
      apiUrl: 'https://api.test',
      cognitoUserPoolId: 'pool-test',
      cognitoClientId: 'client-test',
      cognitoHostedDomain: 'auth.test',
    })
  })

  it('fails naming the variable when one is missing', () => {
    for (const [name, value] of Object.entries(ADMIN_VARIABLES)) vi.stubEnv(name, value)
    vi.stubEnv('VITE_COGNITO_CLIENT_ID', '')

    expect(() => readAdminConfig()).toThrow('VITE_COGNITO_CLIENT_ID')
  })
})
