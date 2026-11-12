import { describe, expect, it } from 'vitest'
import { createAdminScenario } from '../../harness/createAdminScenario.ts'
import { UNKNOWN_USER_ID } from '../../harness/InMemoryUserDirectory.ts'

describe('DeleteUserUseCase', () => {
  it('removes another user', async () => {
    const { useCases, admin, commonUser, userDirectory } = createAdminScenario()
    await useCases.deleteUserUseCase.deleteUser(admin.id, commonUser.id)
    expect(await userDirectory.find(commonUser.id)).toBeNull()
  })

  it('fails when the user does not exist', async () => {
    const { useCases, admin } = createAdminScenario()
    await expect(
      useCases.deleteUserUseCase.deleteUser(admin.id, UNKNOWN_USER_ID),
    ).rejects.toMatchObject({ code: 'not_found' })
  })

  it('does not let an admin delete their own account', async () => {
    const { useCases, admin, userDirectory } = createAdminScenario()
    await expect(useCases.deleteUserUseCase.deleteUser(admin.id, admin.id)).rejects.toMatchObject({
      code: 'self_action',
    })
    expect(await userDirectory.find(admin.id)).not.toBeNull()
  })

  it('refuses a common user and keeps the admin', async () => {
    const { useCases, admin, commonUser, userDirectory } = createAdminScenario()
    await expect(
      useCases.deleteUserUseCase.deleteUser(commonUser.id, admin.id),
    ).rejects.toMatchObject({ code: 'forbidden' })
    expect(await userDirectory.find(admin.id)).not.toBeNull()
  })

  it('refuses to delete the last admin', async () => {
    const { useCases, admin, userDirectory } = createAdminScenario()
    const otherAdmin = userDirectory.seed({ email: 'other@example.com', role: 'admin' })
    userDirectory.countAdmins = async () => 1
    await expect(
      useCases.deleteUserUseCase.deleteUser(admin.id, otherAdmin.id),
    ).rejects.toMatchObject({ code: 'last_admin' })
  })
})
