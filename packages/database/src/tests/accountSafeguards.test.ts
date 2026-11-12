import { beforeEach, describe, expect, it } from 'vitest'
import { type TestDatabase, createTestDatabase } from '../harness/createTestDatabase'

describe('account safeguards', () => {
  let database: TestDatabase
  let firstAdmin: string
  let secondAdmin: string
  let commonUser: string

  const queryDatabase = <Row extends object>(sql: string, params?: unknown[]) =>
    database.db.query<Row>(sql, params)

  const mustChangePasswordOf = async (userId: string) =>
    (
      await queryDatabase<{ must_change_password: boolean }>(
        'select must_change_password from public.profiles where id = $1',
        [userId],
      )
    ).rows[0]?.must_change_password

  beforeEach(async () => {
    database = await createTestDatabase()
    firstAdmin = await database.createUser('first-admin@example.com')
    secondAdmin = await database.createUser('second-admin@example.com')
    commonUser = await database.createUser('common@example.com')
    await database.actAsAdmin()
    await queryDatabase("update public.profiles set role = 'admin' where id = any($1)", [
      [firstAdmin, secondAdmin],
    ])
  })

  describe('forced password change', () => {
    beforeEach(async () => {
      await queryDatabase('update public.profiles set must_change_password = true')
    })

    it('clears the flag only when the password really changes', async () => {
      await queryDatabase("update auth.users set encrypted_password = 'new-hash' where id = $1", [
        commonUser,
      ])
      expect(await mustChangePasswordOf(commonUser)).toBe(false)
      expect(await mustChangePasswordOf(firstAdmin)).toBe(true)
    })

    it('keeps the flag when the password hash is unchanged', async () => {
      await queryDatabase("update auth.users set email = 'renamed@example.com' where id = $1", [
        commonUser,
      ])
      expect(await mustChangePasswordOf(commonUser)).toBe(true)
    })

    it('has no callable function that clears the flag without a password change', async () => {
      await database.actAs(commonUser)
      await expect(queryDatabase('select public.acknowledge_password_change()')).rejects.toThrow(
        /does not exist|permission denied/,
      )
      await database.actAsAdmin()
      expect(await mustChangePasswordOf(commonUser)).toBe(true)
    })
  })

  describe('at least one admin', () => {
    it('lets an admin be demoted or removed while another admin remains', async () => {
      await queryDatabase("update public.profiles set role = 'user' where id = $1", [secondAdmin])
      await expect(
        queryDatabase('select count(*)::int as total from public.profiles where role = $1', ['admin']),
      ).resolves.toMatchObject({ rows: [{ total: 1 }] })
    })

    it('refuses to demote the last admin', async () => {
      await queryDatabase("update public.profiles set role = 'user' where id = $1", [secondAdmin])
      await expect(
        queryDatabase("update public.profiles set role = 'user' where id = $1", [firstAdmin]),
      ).rejects.toThrow(/last admin/)
    })

    it('refuses to delete the last admin, including through the user cascade', async () => {
      await queryDatabase('delete from auth.users where id = $1', [secondAdmin])
      await expect(queryDatabase('delete from auth.users where id = $1', [firstAdmin])).rejects.toThrow(
        /last admin/,
      )
    })

    it('never blocks removing a common user', async () => {
      await queryDatabase('delete from auth.users where id = $1', [commonUser])
      const { rows } = await queryDatabase('select id from public.profiles where id = $1', [commonUser])
      expect(rows).toEqual([])
    })
  })
})
