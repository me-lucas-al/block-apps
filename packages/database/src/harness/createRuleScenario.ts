import { type RuleScenarioActions, createRuleScenarioActions } from './ruleScenarioActions'
import { type TestDatabase, createTestDatabase } from './createTestDatabase'

export type RuleScenario = TestDatabase &
  RuleScenarioActions & {
    readonly alice: string
    readonly bob: string
    readonly ruleId: string
  }

export async function createRuleScenario(): Promise<RuleScenario> {
  const database = await createTestDatabase()
  const alice = await database.createUser('alice@example.com')
  const bob = await database.createUser('bob@example.com')
  const actions = createRuleScenarioActions(database, alice)

  await database.actAs(alice)
  const createdRule = await actions.queryDatabase<{ id: string }>(
    `insert into public.block_rules (target_type, target, mode, windows)
     values ('site', 'example.com', 'always', '[]'::jsonb) returning id`,
  )

  return { ...database, ...actions, alice, bob, ruleId: createdRule.rows[0]!.id }
}
