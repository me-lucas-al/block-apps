import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readAdminAppAccessFromEnvironment } from '../../src/composition/readAdminAppAccessFromEnvironment'

describe('readAdminAppAccessFromEnvironment', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_GROUP_NAME', 'admin')
    vi.stubEnv('ADMIN_CLIENT_ID', 'admin-client')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads the admin group and the admin client from the environment', () => {
    expect(readAdminAppAccessFromEnvironment()).toEqual({
      adminGroupName: 'admin',
      adminClientId: 'admin-client',
    })
  })

  it('fails when ADMIN_CLIENT_ID is missing', () => {
    vi.stubEnv('ADMIN_CLIENT_ID', '')
    expect(() => readAdminAppAccessFromEnvironment()).toThrow(
      'Missing environment variable ADMIN_CLIENT_ID',
    )
  })

  it('fails when ADMIN_GROUP_NAME is missing', () => {
    vi.stubEnv('ADMIN_GROUP_NAME', '')
    expect(() => readAdminAppAccessFromEnvironment()).toThrow(
      'Missing environment variable ADMIN_GROUP_NAME',
    )
  })
})
