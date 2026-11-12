import { beforeEach, describe, expect, it } from 'vitest'
import { type TestDatabase, createTestDatabase } from '../../harness/createTestDatabase'

const INSERT_RULE = `
  insert into public.block_rules (target_type, target, mode, windows)
  values ($1, $2, 'always', '[]'::jsonb)
`

describe('rule target types', () => {
  let database: TestDatabase

  beforeEach(async () => {
    database = await createTestDatabase()
    await database.actAs(await database.createUser('alice@example.com'))
  })

  it.each([
    ['app', 'com.example.app'],
    ['site', 'example.com'],
    ['keyword', 'poker'],
  ])('accepts a %s rule', async (targetType, target) => {
    await database.db.query(INSERT_RULE, [targetType, target])
    const { rows } = await database.db.query('select id from public.block_rules')
    expect(rows).toHaveLength(1)
  })

  it('rejects an unknown target type', async () => {
    await expect(database.db.query(INSERT_RULE, ['search', 'poker'])).rejects.toThrow()
  })

  it('keeps the same text unique per target type', async () => {
    await database.db.query(INSERT_RULE, ['keyword', 'poker'])
    await database.db.query(INSERT_RULE, ['site', 'poker'])
    await expect(database.db.query(INSERT_RULE, ['keyword', 'poker'])).rejects.toThrow()
  })
})
