import type { BlockRule } from '@block-apps/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DynamoBlockRuleStore } from '../../src/storage/dynamodb/rules/DynamoBlockRuleStore'
import { createLocalTable, DYNAMODB_LOCAL_ENDPOINT, type LocalTable } from '../helpers/dynamoLocal'

function buildAlwaysRule(targetType: BlockRule['targetType'], target: string): BlockRule {
  return { id: `${targetType}~${target}`, targetType, target, mode: 'always', windows: [] }
}

describe.skipIf(!DYNAMODB_LOCAL_ENDPOINT)('DynamoBlockRuleStore site rule reader', () => {
  let table: LocalTable
  let ruleStore: DynamoBlockRuleStore

  beforeEach(async () => {
    table = await createLocalTable(DYNAMODB_LOCAL_ENDPOINT ?? '')
    ruleStore = new DynamoBlockRuleStore(table.context)
  })
  afterEach(async () => {
    await table.dropTable()
  })

  it('lists only the site rules of the requested user', async () => {
    const siteRule = buildAlwaysRule('site', 'exemplo.com')
    await ruleStore.insert('user-1', siteRule)
    await ruleStore.insert('user-1', buildAlwaysRule('app', 'com.exemplo.app'))
    await ruleStore.insert('user-1', buildAlwaysRule('keyword', 'jogo'))
    await ruleStore.insert('user-2', buildAlwaysRule('site', 'outro.com'))

    expect(await ruleStore.listSiteRulesByUser('user-1')).toEqual([siteRule])
    expect(await ruleStore.listRulesByUser('user-1')).toHaveLength(3)
  })
})
