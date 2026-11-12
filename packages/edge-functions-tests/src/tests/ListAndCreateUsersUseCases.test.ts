import { describe, expect, it } from 'vitest'
import type { CreateUserInput } from '../../../../supabase/functions/_shared/admin-users/types.ts'
import { createAdminScenario } from '../harness/createAdminScenario.ts'

const NEW_USER: CreateUserInput = {
  email: 'new@example.com',
  password: 'a-long-password',
  displayName: null,
  role: 'user',
  cooldownHours: 24,
  mustChangePassword: true,
}

describe('ListUsersUseCase', () => {
  it('lists every user for an admin', async () => {
    const { useCases, admin } = createAdminScenario()
    expect(await useCases.listUsersUseCase.listUsers(admin.id)).toHaveLength(2)
  })

  it('refuses a common user and an anonymous caller', async () => {
    const { useCases, commonUser } = createAdminScenario()
    await expect(useCases.listUsersUseCase.listUsers(commonUser.id)).rejects.toMatchObject({
      code: 'forbidden',
    })
    await expect(useCases.listUsersUseCase.listUsers(null)).rejects.toMatchObject({
      code: 'unauthenticated',
    })
  })
})

describe('CreateUserUseCase', () => {
  it('creates the user for an admin', async () => {
    const { useCases, admin, userDirectory } = createAdminScenario()
    const created = await useCases.createUserUseCase.createUser(admin.id, NEW_USER)
    expect(created).toMatchObject({ email: 'new@example.com', role: 'user' })
    expect(await userDirectory.find(created.id)).not.toBeNull()
  })

  it('reports a duplicated email as a conflict', async () => {
    const { useCases, admin } = createAdminScenario()
    await expect(
      useCases.createUserUseCase.createUser(admin.id, { ...NEW_USER, email: 'user@example.com' }),
    ).rejects.toMatchObject({ code: 'conflict' })
  })

  it('refuses a common user without creating anything', async () => {
    const { useCases, commonUser, userDirectory } = createAdminScenario()
    await expect(
      useCases.createUserUseCase.createUser(commonUser.id, NEW_USER),
    ).rejects.toMatchObject({ code: 'forbidden' })
    expect(await userDirectory.list()).toHaveLength(2)
  })
})
