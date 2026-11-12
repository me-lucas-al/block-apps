import { describe, expect, it } from 'vitest'
import { callApi } from '../helpers/callApi'
import { buildAdminBackend } from '../helpers/admin/buildAdminBackend'
import { callAdminApi } from '../helpers/admin/callAdminApi'

describe('admin users access', () => {
  it('lists every user with role and cooldown', async () => {
    const backend = buildAdminBackend()
    backend.settings.cooldownHoursByUser.set('user-1', 48)
    const reply = await callAdminApi(backend, 'GET', '/admin/users')
    expect(reply.status).toBe(200)
    expect(reply.json).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'admin-1', role: 'admin', cooldownHours: 24 }),
        expect.objectContaining({ id: 'user-1', role: 'user', displayName: 'Ana', cooldownHours: 48 }),
      ]),
    )
  })

  it('checks the role in Cognito, not only in the token', async () => {
    const backend = buildAdminBackend()
    const reply = await callApi(backend.app, {
      method: 'GET',
      path: '/admin/users',
      userId: 'user-1',
      groups: ['admin'],
    })
    expect(reply.status).toBe(403)
  })

  it('blocks an admin who still has the temporary password', async () => {
    const backend = buildAdminBackend()
    backend.cognito.users.get('admin-1')!.status = 'FORCE_CHANGE_PASSWORD'
    expect((await callAdminApi(backend, 'GET', '/admin/users')).status).toBe(403)
  })

  it('blocks a disabled admin', async () => {
    const backend = buildAdminBackend()
    backend.cognito.users.get('admin-1')!.enabled = false
    expect((await callAdminApi(backend, 'GET', '/admin/users')).status).toBe(403)
  })
})
