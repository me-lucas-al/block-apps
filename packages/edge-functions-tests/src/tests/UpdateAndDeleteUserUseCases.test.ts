import { describe, expect, it } from 'vitest'
import { createAdminScenario } from '../harness/createAdminScenario.ts'
import { UNKNOWN_USER_ID } from '../harness/InMemoryUserDirectory.ts'

describe('UpdateUserUseCase', () => {
  it('updates another user, including cooldown', async () => {
    const { useCases, admin, commonUser } = createAdminScenario()
    const updated = await useCases.updateUserUseCase.updateUser(admin.id, commonUser.id, {
      cooldownHours: 48,
    })
    expect(updated).toMatchObject({ cooldownHours: 48 })
  })

  it('fails when the user does not exist', async () => {
    const { useCases, admin } = createAdminScenario()
    await expect(
      useCases.updateUserUseCase.updateUser(admin.id, UNKNOWN_USER_ID, { displayName: 'x' }),
    ).rejects.toMatchObject({ code: 'not_found' })
  })

  it('refuses a common user', async () => {
    const { useCases, commonUser } = createAdminScenario()
    await expect(
      useCases.updateUserUseCase.updateUser(commonUser.id, commonUser.id, { displayName: 'x' }),
    ).rejects.toMatchObject({ code: 'forbidden' })
  })

  it('does not let an admin demote themselves', async () => {
    const { useCases, admin } = createAdminScenario()
    await expect(
      useCases.updateUserUseCase.updateUser(admin.id, admin.id, { role: 'user' }),
    ).rejects.toMatchObject({ code: 'self_action' })
  })

  it('lets an admin edit their own profile data keeping the role', async () => {
    const { useCases, admin } = createAdminScenario()
    const updated = await useCases.updateUserUseCase.updateUser(admin.id, admin.id, {
      displayName: 'Boss',
      role: 'admin',
    })
    expect(updated.displayName).toBe('Boss')
  })

  it('forces a password change after the admin resets a password', async () => {
    const { useCases, admin, commonUser } = createAdminScenario()
    const updated = await useCases.updateUserUseCase.updateUser(admin.id, commonUser.id, {
      password: 'another-long-password',
    })
    expect(updated.mustChangePassword).toBe(true)
  })

  it('respects an explicit choice about the forced password change', async () => {
    const { useCases, admin, commonUser } = createAdminScenario()
    const updated = await useCases.updateUserUseCase.updateUser(admin.id, commonUser.id, {
      password: 'another-long-password',
      mustChangePassword: false,
    })
    expect(updated.mustChangePassword).toBe(false)
  })

  it('requires a new password when promoting a user to admin', async () => {
    const { useCases, admin, commonUser } = createAdminScenario()
    await expect(
      useCases.updateUserUseCase.updateUser(admin.id, commonUser.id, { role: 'admin' }),
    ).rejects.toMatchObject({ code: 'invalid_input' })

    const promoted = await useCases.updateUserUseCase.updateUser(admin.id, commonUser.id, {
      role: 'admin',
      password: 'brand-new-password',
    })
    expect(promoted).toMatchObject({ role: 'admin', mustChangePassword: true })
  })

  it('refuses to demote the last admin', async () => {
    const { useCases, admin, userDirectory } = createAdminScenario()
    const otherAdmin = userDirectory.seed({ email: 'other@example.com', role: 'admin' })
    userDirectory.countAdmins = async () => 1
    await expect(
      useCases.updateUserUseCase.updateUser(admin.id, otherAdmin.id, { role: 'user' }),
    ).rejects.toMatchObject({ code: 'last_admin' })
  })
})

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
    await expect(useCases.deleteUserUseCase.deleteUser(admin.id, otherAdmin.id)).rejects.toMatchObject({
      code: 'last_admin',
    })
  })
})
