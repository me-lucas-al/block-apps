import { beforeEach, describe, expect, it } from 'vitest'
import { type TestDatabase, createTestDatabase } from '../harness/createTestDatabase'

type ProfileRow = { id: string; role: string; display_name: string | null }

describe('user roles', () => {
  let database: TestDatabase
  let admin: string
  let alice: string
  let bob: string

  const query = <T extends object>(sql: string, params?: unknown[]) =>
    database.db.query<T>(sql, params)

  const profileIds = async () =>
    (await query<ProfileRow>('select id from public.profiles order by id')).rows.map((row) => row.id)

  beforeEach(async () => {
    database = await createTestDatabase()
    admin = await database.createUser('admin@example.com')
    alice = await database.createUser('alice@example.com')
    bob = await database.createUser('bob@example.com')
    await database.actAsAdmin()
    await query("update public.profiles set role = 'admin' where id = $1", [admin])
  })

  it('creates common users by default', async () => {
    await database.actAs(alice)
    const { rows } = await query<ProfileRow>('select role from public.profiles')
    expect(rows).toEqual([{ role: 'user' }])
  })

  it('lets only admins see every profile', async () => {
    await database.actAs(alice)
    expect(await profileIds()).toEqual([alice])
    await database.actAs(admin)
    expect(await profileIds()).toHaveLength(3)
  })

  it('reports whether the caller is an admin', async () => {
    const isAdmin = async () =>
      (await query<{ admin: boolean }>('select public.is_admin() as admin')).rows[0]?.admin
    await database.actAs(admin)
    expect(await isAdmin()).toBe(true)
    await database.actAs(alice)
    expect(await isAdmin()).toBe(false)
  })

  it('lets users edit only their own display name', async () => {
    await database.actAs(alice)
    await query("update public.profiles set display_name = 'Alice'")
    const { rows } = await query<ProfileRow>('select display_name from public.profiles')
    expect(rows).toEqual([{ display_name: 'Alice' }])
  })

  it.each(['role', 'cooldown_hours', 'must_change_password'])(
    'does not let users change their own %s',
    async (column) => {
      await database.actAs(alice)
      const value = column === 'role' ? "'admin'" : column === 'cooldown_hours' ? '0' : 'false'
      await expect(query(`update public.profiles set ${column} = ${value}`)).rejects.toThrow(
        /permission denied/,
      )
    },
  )

  it("does not let a user edit someone else's profile", async () => {
    await database.actAs(alice)
    const result = await query('update public.profiles set display_name = $1 where id = $2', [
      'Hacked',
      bob,
    ])
    expect(result.affectedRows).toBe(0)
  })

  it('does not let admins edit other profiles through the data API', async () => {
    await database.actAs(admin)
    const result = await query('update public.profiles set display_name = $1 where id = $2', [
      'Edited',
      alice,
    ])
    expect(result.affectedRows).toBe(0)
  })

  it('rejects display names longer than 80 characters', async () => {
    await database.actAs(alice)
    await expect(
      query('update public.profiles set display_name = $1', ['x'.repeat(81)]),
    ).rejects.toThrow(/display_name/)
  })

  it('clears the forced password change flag only for the caller', async () => {
    await database.actAsAdmin()
    await query('update public.profiles set must_change_password = true')
    await database.actAs(alice)
    await query('select public.acknowledge_password_change()')
    await database.actAsAdmin()
    const { rows } = await query<{ id: string; must_change_password: boolean }>(
      'select id, must_change_password from public.profiles',
    )
    expect(rows.find((row) => row.id === alice)?.must_change_password).toBe(false)
    expect(rows.find((row) => row.id === bob)?.must_change_password).toBe(true)
  })

  it('denies the role helpers to anonymous callers', async () => {
    await database.actAsAnonymous()
    await expect(query('select public.is_admin()')).rejects.toThrow(/permission denied/)
  })
})
