import { describe, expect, it } from 'vitest'
import { readLocalServerConfig } from '../../src/local/readLocalServerConfig'

const LOCAL_ENV = { DYNAMODB_ENDPOINT: 'http://127.0.0.1:8000' }

describe('readLocalServerConfig', () => {
  it('reads the defaults for a local setup', () => {
    expect(readLocalServerConfig(LOCAL_ENV)).toMatchObject({
      endpoint: 'http://127.0.0.1:8000',
      tableName: 'block-apps-local-data',
      port: 3000,
      hostname: '127.0.0.1',
      allowedOrigins: [],
      maxRulesPerUser: 200,
    })
  })

  it('reads the rule limit from MAX_RULES_PER_USER and refuses an invalid one', () => {
    expect(readLocalServerConfig({ ...LOCAL_ENV, MAX_RULES_PER_USER: '5' }).maxRulesPerUser).toBe(5)
    expect(() => readLocalServerConfig({ ...LOCAL_ENV, MAX_RULES_PER_USER: '0' })).toThrow(
      'MAX_RULES_PER_USER',
    )
  })

  it.each([
    'AWS_LAMBDA_FUNCTION_NAME',
    'AWS_EXECUTION_ENV',
    'ECS_CONTAINER_METADATA_URI_V4',
    'AWS_WEB_IDENTITY_TOKEN_FILE',
  ])('refuses to start when %s is set', (signal) => {
    expect(() => readLocalServerConfig({ ...LOCAL_ENV, [signal]: 'x' })).toThrow('never run on AWS')
  })

  it('refuses a DynamoDB endpoint that is not local', () => {
    const env = { DYNAMODB_ENDPOINT: 'https://dynamodb.us-east-1.amazonaws.com' }
    expect(() => readLocalServerConfig(env)).toThrow('local DynamoDB')
  })

  it('requires an endpoint', () => {
    expect(() => readLocalServerConfig({})).toThrow('DYNAMODB_ENDPOINT')
  })

  it('refuses a public bind address unless it is explicitly allowed', () => {
    expect(() => readLocalServerConfig({ ...LOCAL_ENV, HOST: '0.0.0.0' })).toThrow('loopback')
    const allowed = readLocalServerConfig({ ...LOCAL_ENV, HOST: '0.0.0.0', LOCAL_API_ALLOW_REMOTE_HOST: 'true' })
    expect(allowed.hostname).toBe('0.0.0.0')
  })

  it('reads extra origins and hosts from comma separated lists', () => {
    const config = readLocalServerConfig({
      ...LOCAL_ENV,
      LOCAL_ALLOWED_ORIGINS: 'http://a.local, http://b.local',
      LOCAL_ALLOWED_HOSTS: 'api',
    })
    expect(config.allowedOrigins).toEqual(['http://a.local', 'http://b.local'])
    expect(config.allowedHosts).toEqual(['api'])
  })
})
