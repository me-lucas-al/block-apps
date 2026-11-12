import { describe, expect, it } from 'vitest'
import { createAdminScenario } from '../harness/createAdminScenario.ts'

describe('UpdateUserUseCase', () => {
  it('updates another user, including role and cooldown', async () => {
    const { useCases, admin, commonUser } = createAdminScenario()
    const updated = await useCases.updateUserUseCase.updateUser(admin.id, commonUser.id, {
      role: 'admin',
      cooldownHours: 48,
    })
    expect(updated).toMatchObject({ role: 'admin', cooldownHours: 48 })
  })

  it('fails when the user does not exist', async () => {
    const { useCases, admin } = createAdminScenario()
    await expect(
      useCases.updateUserUseCase.updateUser(admin.id, 'ghost', { displayName: 'x' }),
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
})

describe('DeleteUserUseCase', () => {
  it('removes another user', async () => {
    const { useCases, admin, commonUser, userDirectory } = createAdminScenario()
    await useCases.deleteUserUseCase.deleteUser(admin.id, commonUser.id)
    expect(await userDirectory.find(commonUser.id)).toBeNull()
  })

  it('fails when the user does not exist', async () => {
    const { useCases, admin } = createAdminScenario()
    await expect(useCases.deleteUserUseCase.deleteUser(admin.id, 'ghost')).rejects.toMatchObject({
      code: 'not_found',
    })
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
})
