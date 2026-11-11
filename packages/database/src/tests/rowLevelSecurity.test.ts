import { beforeEach, describe, expect, it } from 'vitest'
import { type TestDatabase, createTestDatabase } from '../harness/createTestDatabase'

const INSERT_RULE = `
  insert into public.block_rules (target_type, target, mode, windows)
  values ('site', $1, 'always', '[]'::jsonb) returning id
`

describe('row level security', () => {
  let database: TestDatabase
  let alice: string
  let bob: string

  beforeEach(async () => {
    database = await createTestDatabase()
    alice = await database.createUser('alice@example.com')
    bob = await database.createUser('bob@example.com')
  })

  it('creates a profile with the default cooldown for new users', async () => {
    await database.actAs(alice)
    const { rows } = await database.db.query<{ cooldown_hours: number }>(
      'select cooldown_hours from public.profiles',
    )
    expect(rows).toEqual([{ cooldown_hours: 24 }])
  })

  it('lets users insert and read their own rules', async () => {
    await database.actAs(alice)
    await database.db.query(INSERT_RULE, ['example.com'])
    const { rows } = await database.db.query('select id from public.block_rules')
    expect(rows).toHaveLength(1)
  })

  it('hides rules from other users', async () => {
    await database.actAs(alice)
    await database.db.query(INSERT_RULE, ['example.com'])
    await database.actAs(bob)
    const { rows } = await database.db.query('select id from public.block_rules')
    expect(rows).toEqual([])
  })

  it('rejects inserting a rule for another user', async () => {
    await database.actAs(alice)
    await expect(
      database.db.query(
        `insert into public.block_rules (user_id, target_type, target, mode)
         values ($1, 'site', 'example.com', 'always')`,
        [bob],
      ),
    ).rejects.toThrow()
  })

  it('rejects duplicate targets for the same user', async () => {
    await database.actAs(alice)
    await database.db.query(INSERT_RULE, ['example.com'])
    await expect(database.db.query(INSERT_RULE, ['example.com'])).rejects.toThrow()
  })

  it('gives anonymous callers no rules and no way to insert', async () => {
    await database.actAs(alice)
    await database.db.query(INSERT_RULE, ['example.com'])
    await database.actAsAnonymous()
    const { rows } = await database.db.query('select id from public.block_rules')
    expect(rows).toEqual([])
    await expect(database.db.query(INSERT_RULE, ['other.com'])).rejects.toThrow()
  })
})
