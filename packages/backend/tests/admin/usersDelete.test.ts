import { describe, expect, it } from 'vitest'
import { buildAdminBackend } from '../helpers/admin/buildAdminBackend'
import { callAdminApi } from '../helpers/admin/callAdminApi'
import { ConflictError } from '../../src/domain/errors/ConflictError'
import { LastAdminGuard } from '../../src/users/guards/LastAdminGuard'

describe('delete user', () => {
  it('removes the user and erases the data', async () => {
    const backend = buildAdminBackend()
    const reply = await callAdminApi(backend, 'DELETE', '/admin/users/user-1')
    expect(reply.status).toBe(204)
    expect(backend.cognito.users.has('user-1')).toBe(false)
    expect(backend.settings.erasedUserIds).toEqual(['user-1'])
  })

  it('does not let an admin delete their own account', async () => {
    const backend = buildAdminBackend()
    expect((await callAdminApi(backend, 'DELETE', '/admin/users/admin-1')).status).toBe(409)
    expect(backend.cognito.users.has('admin-1')).toBe(true)
  })

  it('answers 404 for an unknown user', async () => {
    const backend = buildAdminBackend()
    expect((await callAdminApi(backend, 'DELETE', '/admin/users/ghost')).status).toBe(404)
  })

  it('refuses to remove the last admin', async () => {
    const onlyOneAdmin = { countAdmins: async () => 1, find: async () => null, list: async () => [] }
    await expect(new LastAdminGuard(onlyOneAdmin).requireAnotherAdmin()).rejects.toBeInstanceOf(ConflictError)
  })
})
