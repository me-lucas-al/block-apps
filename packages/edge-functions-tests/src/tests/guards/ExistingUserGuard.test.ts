import { describe, expect, it } from 'vitest'
import { createAdminScenario } from '../../harness/createAdminScenario.ts'
import { UNKNOWN_USER_ID } from '../../harness/InMemoryUserDirectory.ts'

describe('ExistingUserGuard', () => {
  it('returns an existing user', async () => {
    const { existingUserGuard, commonUser } = createAdminScenario()
    expect(await existingUserGuard.requireExistingUser(commonUser.id)).toEqual(commonUser)
  })

  it('rejects an unknown user as not found', async () => {
    const { existingUserGuard } = createAdminScenario()
    await expect(existingUserGuard.requireExistingUser(UNKNOWN_USER_ID)).rejects.toMatchObject({
      code: 'not_found',
    })
  })
})
