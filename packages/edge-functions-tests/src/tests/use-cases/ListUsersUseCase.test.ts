import { describe, expect, it } from 'vitest'
import { createAdminScenario } from '../../harness/createAdminScenario.ts'

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
