import { beforeEach, describe, expect, it } from 'vitest'
import { type TestDatabase, createTestDatabase } from '../harness/createTestDatabase'

const SCHEDULE_WINDOWS = JSON.stringify([{ days: [1], start: '18:00', end: '20:00' }])

type RuleRow = { id: string; mode: string; windows: unknown }
type RequestRow = { kind: string; effective_at: Date }

describe('rule change cooldown', () => {
  let database: TestDatabase
  let alice: string
  let bob: string
  let ruleId: string

  const query = <T extends object>(sql: string, params?: unknown[]) =>
    database.db.query<T>(sql, params as unknown[])

  const readRule = async () =>
    (await query<RuleRow>('select id, mode, windows from public.block_rules')).rows

  const expirePendingRequests = async () => {
    await database.actAsAdmin()
    await query("update public.rule_change_requests set effective_at = now() - interval '1 minute'")
    await database.actAs(alice)
  }

  beforeEach(async () => {
    database = await createTestDatabase()
    alice = await database.createUser('alice@example.com')
    bob = await database.createUser('bob@example.com')
    await database.actAs(alice)
    const created = await query<{ id: string }>(
      `insert into public.block_rules (target_type, target, mode, windows)
       values ('site', 'example.com', 'always', '[]'::jsonb) returning id`,
    )
    ruleId = created.rows[0]!.id
  })

  it('denies direct updates and deletes on rules', async () => {
    const update = await query("update public.block_rules set mode = 'schedule'")
    const removal = await query('delete from public.block_rules')
    expect(update.affectedRows).toBe(0)
    expect(removal.affectedRows).toBe(0)
    expect((await readRule())[0]?.mode).toBe('always')
  })

  it('schedules a removal after the cooldown and keeps the rule meanwhile', async () => {
    const { rows } = await query<RequestRow>(
      'select kind, effective_at from public.request_rule_removal($1)',
      [ruleId],
    )
    const hoursAhead = (rows[0]!.effective_at.getTime() - Date.now()) / 3_600_000
    expect(rows[0]!.kind).toBe('delete')
    expect(hoursAhead).toBeGreaterThan(23)
    expect(hoursAhead).toBeLessThanOrEqual(24)
    expect(await readRule()).toHaveLength(1)
  })

  it('does not apply changes before they are due', async () => {
    await query('select * from public.request_rule_removal($1)', [ruleId])
    const applied = await query<{ count: number }>(
      'select public.apply_due_rule_changes() as count',
    )
    expect(applied.rows[0]?.count).toBe(0)
    expect(await readRule()).toHaveLength(1)
  })

  it('removes the rule once the removal is due', async () => {
    await query('select * from public.request_rule_removal($1)', [ruleId])
    await expirePendingRequests()
    const applied = await query<{ count: number }>(
      'select public.apply_due_rule_changes() as count',
    )
    expect(applied.rows[0]?.count).toBe(1)
    expect(await readRule()).toEqual([])
  })

  it('applies a scheduled update once it is due', async () => {
    await query('select * from public.request_rule_update($1, $2, $3::jsonb)', [
      ruleId,
      'schedule',
      SCHEDULE_WINDOWS,
    ])
    expect((await readRule())[0]?.mode).toBe('always')
    await expirePendingRequests()
    await query('select public.apply_due_rule_changes()')
    const [rule] = await readRule()
    expect(rule?.mode).toBe('schedule')
    expect(rule?.windows).toEqual(JSON.parse(SCHEDULE_WINDOWS))
  })

  it('keeps a single pending request per rule and restarts the clock', async () => {
    await query('select * from public.request_rule_removal($1)', [ruleId])
    await query('select * from public.request_rule_update($1, $2, $3::jsonb)', [
      ruleId,
      'schedule',
      SCHEDULE_WINDOWS,
    ])
    const { rows } = await query<RequestRow>('select kind, effective_at from public.rule_change_requests')
    expect(rows).toHaveLength(1)
    expect(rows[0]?.kind).toBe('update')
  })

  it('lets the owner cancel a pending change', async () => {
    await query('select * from public.request_rule_removal($1)', [ruleId])
    await query('delete from public.rule_change_requests')
    const { rows } = await query('select id from public.rule_change_requests')
    expect(rows).toEqual([])
    expect(await readRule()).toHaveLength(1)
  })

  it('applies changes immediately when the cooldown is zero', async () => {
    await database.actAsAdmin()
    await query('update public.profiles set cooldown_hours = 0 where id = $1', [alice])
    await database.actAs(alice)
    await query('select * from public.request_rule_removal($1)', [ruleId])
    expect(await readRule()).toEqual([])
  })

  it('does not let users change their own cooldown', async () => {
    const result = await query('update public.profiles set cooldown_hours = 0')
    expect(result.affectedRows).toBe(0)
  })

  it('rejects change requests for rules owned by someone else', async () => {
    await database.actAs(bob)
    await expect(
      query('select * from public.request_rule_removal($1)', [ruleId]),
    ).rejects.toThrow(/Rule not found/)
  })

  it('hides pending changes from other users', async () => {
    await query('select * from public.request_rule_removal($1)', [ruleId])
    await database.actAs(bob)
    const { rows } = await query('select id from public.rule_change_requests')
    expect(rows).toEqual([])
  })

  it('denies change requests to anonymous callers', async () => {
    await database.actAsAnonymous()
    await expect(
      query('select * from public.request_rule_removal($1)', [ruleId]),
    ).rejects.toThrow(/permission denied/)
  })

  it('rejects change requests from authenticated callers without a subject', async () => {
    await database.actAs('')
    await expect(
      query('select * from public.request_rule_removal($1)', [ruleId]),
    ).rejects.toThrow(/Not authenticated/)
  })

  it('does not expose the internal per-user apply function', async () => {
    await expect(
      query('select public.apply_due_changes_for($1)', [alice]),
    ).rejects.toThrow(/permission denied/)
  })
})
