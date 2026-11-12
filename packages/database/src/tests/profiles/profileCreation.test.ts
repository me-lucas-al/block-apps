import { beforeEach, describe, expect, it } from 'vitest'
import { type TestDatabase, createTestDatabase } from '../../harness/createTestDatabase'

describe('profile creation', () => {
  let database: TestDatabase

  beforeEach(async () => {
    database = await createTestDatabase()
  })

  it('creates a profile with the default cooldown and role for every new user', async () => {
    const alice = await database.createUser('alice@example.com')
    await database.actAs(alice)
    const { rows } = await database.db.query<{ cooldown_hours: number; role: string }>(
      'select cooldown_hours, role from public.profiles',
    )
    expect(rows).toEqual([{ cooldown_hours: 24, role: 'user' }])
  })
})
