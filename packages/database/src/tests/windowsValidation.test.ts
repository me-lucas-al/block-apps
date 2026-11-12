import { beforeEach, describe, expect, it } from 'vitest'
import { type TestDatabase, createTestDatabase } from '../harness/createTestDatabase'

const VALID_WINDOW = { days: [1, 2], start: '18:00', end: '20:00' }

describe('windows validation', () => {
  let database: TestDatabase

  const isValid = async (windows: unknown) =>
    (
      await database.db.query<{ valid: boolean }>(
        'select public.are_valid_windows($1::jsonb) as valid',
        [JSON.stringify(windows)],
      )
    ).rows[0]?.valid

  beforeEach(async () => {
    database = await createTestDatabase()
  })

  it.each([
    ['an empty list', []],
    ['one valid window', [VALID_WINDOW]],
    ['a window crossing midnight', [{ days: [5], start: '22:00', end: '02:00' }]],
  ])('accepts %s', async (_name, windows) => {
    expect(await isValid(windows)).toBe(true)
  })

  it.each([
    ['an object instead of a list', {}],
    ['null', null],
    ['an element that is not an object', ['18:00']],
    ['a window without days', [{ start: '18:00', end: '20:00' }]],
    ['a window with empty days', [{ ...VALID_WINDOW, days: [] }]],
    ['a day above 6', [{ ...VALID_WINDOW, days: [7] }]],
    ['a negative day', [{ ...VALID_WINDOW, days: [-1] }]],
    ['a day as text', [{ ...VALID_WINDOW, days: ['1'] }]],
    ['a start hour above 23', [{ ...VALID_WINDOW, start: '24:00' }]],
    ['a start without leading zero', [{ ...VALID_WINDOW, start: '8:00' }]],
    ['a numeric end', [{ ...VALID_WINDOW, end: 2000 }]],
    ['a window without end', [{ days: [1], start: '18:00' }]],
  ])('rejects %s', async (_name, windows) => {
    expect(await isValid(windows)).toBe(false)
  })

  it('rejects a rule inserted with malformed windows', async () => {
    const userId = await database.createUser('alice@example.com')
    await database.actAs(userId)
    await expect(
      database.db.query(
        `insert into public.block_rules (target_type, target, mode, windows)
         values ('site', 'example.com', 'schedule', '{}'::jsonb)`,
      ),
    ).rejects.toThrow(/block_rules_windows_valid/)
  })
})
