import { describe, expect, it } from 'vitest'
import type { CreateUserInput } from '../../../../../supabase/functions/_shared/admin-users/model/userInputs.ts'
import { createAdminScenario } from '../../harness/createAdminScenario.ts'

const NEW_USER: CreateUserInput = {
  email: 'new@example.com',
  password: 'a-long-password',
  displayName: null,
  role: 'user',
  cooldownHours: 24,
  mustChangePassword: true,
}

describe('CreateUserUseCase', () => {
  it('creates the user for an admin', async () => {
    const { useCases, admin, userDirectory } = createAdminScenario()
    const createdUser = await useCases.createUserUseCase.createUser(admin.id, NEW_USER)
    expect(createdUser).toMatchObject({ email: 'new@example.com', role: 'user' })
    expect(await userDirectory.find(createdUser.id)).not.toBeNull()
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
