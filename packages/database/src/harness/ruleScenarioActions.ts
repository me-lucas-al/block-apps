import type { Results } from '@electric-sql/pglite'
import type { TestDatabase } from './TestDatabase'

export type RuleRow = { id: string; mode: string; windows: unknown }

export type RuleScenarioActions = {
  queryDatabase<Row extends object>(sql: string, params?: unknown[]): Promise<Results<Row>>
  readRules(): Promise<RuleRow[]>
  expirePendingRequests(): Promise<void>
}

export function createRuleScenarioActions(
  database: TestDatabase,
  ruleOwnerId: string,
): RuleScenarioActions {
  const queryDatabase = <Row extends object>(sql: string, params?: unknown[]) =>
    database.db.query<Row>(sql, params)

  return {
    queryDatabase,
    async readRules() {
      const { rows } = await queryDatabase<RuleRow>('select id, mode, windows from public.block_rules')
      return rows
    },
    async expirePendingRequests() {
      await database.actAsAdmin()
      await queryDatabase(
        "update public.rule_change_requests set effective_at = now() - interval '1 minute'",
      )
      await database.actAs(ruleOwnerId)
    },
  }
}
