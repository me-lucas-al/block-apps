import { describe, expect, it } from 'vitest'
import { callApi } from '../helpers/callApi'
import { buildAdminBackend } from '../helpers/admin/buildAdminBackend'
import { callAdminApi } from '../helpers/admin/callAdminApi'
import { ADMIN_ONE, FEDERATED_ADMIN, USER_ONE } from '../helpers/admin/userIds'

describe('admin users access', () => {
  it('lists every user across pages with role and cooldown', async () => {
    const backend = buildAdminBackend()
    backend.settings.cooldownHoursByUser.set(USER_ONE, 48)
    const reply = await callAdminApi(backend, 'GET', '/admin/users')
    expect(reply.status).toBe(200)
    expect(reply.json).toHaveLength(5)
    expect(reply.json).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: ADMIN_ONE, role: 'admin', cooldownHours: 24 }),
        expect.objectContaining({ id: FEDERATED_ADMIN, role: 'admin' }),
        expect.objectContaining({ id: USER_ONE, role: 'user', displayName: 'Ana', cooldownHours: 48 }),
      ]),
    )
  })

  it('checks the role in Cognito, not only in the token', async () => {
    const backend = buildAdminBackend()
    const reply = await callApi(backend.app, {
      method: 'GET',
      path: '/admin/users',
      userId: USER_ONE,
      groups: ['admin'],
    })
    expect(reply.status).toBe(403)
  })

  it('lets a federated admin in, finding the account by its sub', async () => {
    const reply = await callAdminApi(buildAdminBackend(), 'GET', '/admin/users', undefined, FEDERATED_ADMIN)
    expect(reply.status).toBe(200)
  })

  it('blocks an admin who still has the temporary password', async () => {
    const backend = buildAdminBackend()
    backend.cognito.users.get(ADMIN_ONE)!.status = 'FORCE_CHANGE_PASSWORD'
    expect((await callAdminApi(backend, 'GET', '/admin/users')).status).toBe(403)
  })

  it('blocks a disabled admin', async () => {
    const backend = buildAdminBackend()
    backend.cognito.users.get(ADMIN_ONE)!.enabled = false
    expect((await callAdminApi(backend, 'GET', '/admin/users')).status).toBe(403)
  })

  it('blocks an admin whose TOTP MFA is not active', async () => {
    const backend = buildAdminBackend()
    backend.cognito.users.get(ADMIN_ONE)!.mfaSettingList = []
    const reply = await callAdminApi(backend, 'GET', '/admin/users')
    expect(reply.status).toBe(403)
  })

  it('allows an admin without MFA when requireMfa is disabled', async () => {
    const backend = buildAdminBackend({ requireMfa: false })
    backend.cognito.users.get(ADMIN_ONE)!.mfaSettingList = []
    const reply = await callAdminApi(backend, 'GET', '/admin/users')
    expect(reply.status).toBe(200)
  })
})
