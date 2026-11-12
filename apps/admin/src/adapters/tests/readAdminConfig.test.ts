import { describe, expect, it } from 'vitest'
import { readAdminConfig } from '../readAdminConfig'

describe('readAdminConfig', () => {
  it('returns valid config with default values if env missing', () => {
    const config = readAdminConfig()
    expect(config.apiUrl).toContain('https://')
    expect(config.cognitoUserPoolId).toBeTruthy()
    expect(config.cognitoClientId).toBeTruthy()
    expect(config.cognitoHostedDomain).toBeTruthy()
  })
})
