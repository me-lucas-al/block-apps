import { describe, expect, it } from 'vitest'
import { ConflictError } from '../../src/domain/errors/ConflictError'
import { LastAdminGuard } from '../../src/users/guards/LastAdminGuard'
import { buildAdminBackend } from '../helpers/admin/buildAdminBackend'
import { callAdminApi } from '../helpers/admin/callAdminApi'
import { ADMIN_ONE, FEDERATED_ADMIN, UNKNOWN_USER, USER_ONE } from '../helpers/admin/userIds'

const deleteUser = (userId: string, backend = buildAdminBackend(), callerId = ADMIN_ONE) =>
  callAdminApi(backend, 'DELETE', `/admin/users/${userId}`, undefined, callerId)

describe('delete user', () => {
  it('removes the user and erases the data stored under the user id', async () => {
    const backend = buildAdminBackend()
    expect((await deleteUser(USER_ONE, backend)).status).toBe(204)
    expect(backend.cognito.users.has(USER_ONE)).toBe(false)
    expect(backend.settings.erasedUserIds).toEqual([USER_ONE])
  })

  it('erases by sub and removes by username for a federated account', async () => {
    const backend = buildAdminBackend()
    await deleteUser(FEDERATED_ADMIN, backend)
    expect(backend.cognito.users.has('Google_104')).toBe(false)
    expect(backend.settings.erasedUserIds).toEqual([FEDERATED_ADMIN])
  })

  it('does not let an admin delete their own account', async () => {
    const backend = buildAdminBackend()
    expect((await deleteUser(ADMIN_ONE, backend)).status).toBe(409)
    expect((await deleteUser(FEDERATED_ADMIN, backend, FEDERATED_ADMIN)).status).toBe(409)
    expect(backend.cognito.users.has(ADMIN_ONE)).toBe(true)
  })

  it('refuses an email in place of the user id', async () => {
    const backend = buildAdminBackend()
    expect((await deleteUser('admin1@example.com', backend)).status).toBe(400)
    expect(backend.cognito.users.has(ADMIN_ONE)).toBe(true)
  })

  it('answers 404 for an unknown user', async () => {
    expect((await deleteUser(UNKNOWN_USER)).status).toBe(404)
  })

  it('refuses to remove the last usable admin', async () => {
    const onlyOneAdmin = { countAdmins: async () => 1, find: async () => null, list: async () => [] }
    await expect(new LastAdminGuard(onlyOneAdmin).requireAnotherAdmin()).rejects.toBeInstanceOf(
      ConflictError,
    )
  })
})
