import { beforeEach, describe, expect, it } from 'vitest'
import { type TestDatabase, createTestDatabase } from '../../harness/createTestDatabase'

describe('profile editing', () => {
  let database: TestDatabase
  let alice: string
  let bob: string

  const queryDatabase = <Row extends object>(sql: string, params?: unknown[]) =>
    database.db.query<Row>(sql, params)

  beforeEach(async () => {
    database = await createTestDatabase()
    alice = await database.createUser('alice@example.com')
    bob = await database.createUser('bob@example.com')
  })

  it('lets users edit only their own display name', async () => {
    await database.actAs(alice)
    await queryDatabase("update public.profiles set display_name = 'Alice'")
    const { rows } = await queryDatabase<{ display_name: string | null }>(
      'select display_name from public.profiles',
    )
    expect(rows).toEqual([{ display_name: 'Alice' }])
  })

  it.each([
    ['role', "'admin'"],
    ['cooldown_hours', '0'],
    ['must_change_password', 'false'],
  ])('does not let users change their own %s', async (column, forbiddenAssignment) => {
    await database.actAs(alice)
    await expect(
      queryDatabase(`update public.profiles set ${column} = ${forbiddenAssignment}`),
    ).rejects.toThrow(/permission denied/)
  })

  it("does not let a user edit someone else's profile", async () => {
    await database.actAs(alice)
    const otherProfileUpdate = await queryDatabase(
      'update public.profiles set display_name = $1 where id = $2',
      ['Hacked', bob],
    )
    expect(otherProfileUpdate.affectedRows).toBe(0)
  })

  it('rejects display names longer than 80 characters', async () => {
    await database.actAs(alice)
    await expect(
      queryDatabase('update public.profiles set display_name = $1', ['x'.repeat(81)]),
    ).rejects.toThrow(/display_name/)
  })
})
