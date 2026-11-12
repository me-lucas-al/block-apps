import type { Results } from '@electric-sql/pglite'
import { type TestDatabase, createTestDatabase } from './createTestDatabase'

export type RuleRow = { id: string; mode: string; windows: unknown }

export type RuleScenario = TestDatabase & {
  readonly alice: string
  readonly bob: string
  readonly ruleId: string
  query<T extends object>(sql: string, params?: unknown[]): Promise<Results<T>>
  readRules(): Promise<RuleRow[]>
  expirePendingRequests(): Promise<void>
}

export async function createRuleScenario(): Promise<RuleScenario> {
  const database = await createTestDatabase()
  const alice = await database.createUser('alice@example.com')
  const bob = await database.createUser('bob@example.com')

  const query = <T extends object>(sql: string, params?: unknown[]) =>
    database.db.query<T>(sql, params)

  await database.actAs(alice)
  const created = await query<{ id: string }>(
    `insert into public.block_rules (target_type, target, mode, windows)
     values ('site', 'example.com', 'always', '[]'::jsonb) returning id`,
  )

  return {
    ...database,
    alice,
    bob,
    ruleId: created.rows[0]!.id,
    query,
    async readRules() {
      return (await query<RuleRow>('select id, mode, windows from public.block_rules')).rows
    },
    async expirePendingRequests() {
      await database.actAsAdmin()
      await query(
        "update public.rule_change_requests set effective_at = now() - interval '1 minute'",
      )
      await database.actAs(alice)
    },
  }
}
