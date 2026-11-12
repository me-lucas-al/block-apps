import { beforeEach, describe, expect, it } from 'vitest'
import { type TestDatabase, createTestDatabase } from '../harness/createTestDatabase'

type ProfileRow = { id: string; role: string; display_name: string | null }

describe('user roles', () => {
  let database: TestDatabase
  let admin: string
  let alice: string
  let bob: string

  const queryDatabase = <Row extends object>(sql: string, params?: unknown[]) =>
    database.db.query<Row>(sql, params)

  const visibleProfileIds = async () =>
    (await queryDatabase<ProfileRow>('select id from public.profiles order by id')).rows.map(
      (row) => row.id,
    )

  beforeEach(async () => {
    database = await createTestDatabase()
    admin = await database.createUser('admin@example.com')
    alice = await database.createUser('alice@example.com')
    bob = await database.createUser('bob@example.com')
    await database.actAsAdmin()
    await queryDatabase("update public.profiles set role = 'admin' where id = $1", [admin])
  })

  it('creates common users by default', async () => {
    await database.actAs(alice)
    const { rows } = await queryDatabase<ProfileRow>('select role from public.profiles')
    expect(rows).toEqual([{ role: 'user' }])
  })

  it('lets only admins see every profile', async () => {
    await database.actAs(alice)
    expect(await visibleProfileIds()).toEqual([alice])
    await database.actAs(admin)
    expect(await visibleProfileIds()).toHaveLength(3)
  })

  it('reports whether the caller is an admin', async () => {
    const isAdmin = async () =>
      (await queryDatabase<{ admin: boolean }>('select public.is_admin() as admin')).rows[0]?.admin
    await database.actAs(admin)
    expect(await isAdmin()).toBe(true)
    await database.actAs(alice)
    expect(await isAdmin()).toBe(false)
  })

  it('denies the role helper to anonymous callers', async () => {
    await database.actAsAnonymous()
    await expect(queryDatabase('select public.is_admin()')).rejects.toThrow(/permission denied/)
  })

  it('does not let admins edit other profiles through the data API', async () => {
    await database.actAs(admin)
    const result = await queryDatabase('update public.profiles set display_name = $1 where id = $2', [
      'Edited',
      alice,
    ])
    expect(result.affectedRows).toBe(0)
    expect(bob).not.toBe(alice)
  })
})
