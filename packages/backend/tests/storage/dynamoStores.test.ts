import { PutCommand } from '@aws-sdk/lib-dynamodb'
import type { PendingRuleChange } from '@block-apps/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDynamoStores } from '../../src/composition/createDynamoStores'
import type { ApiStores } from '../../src/composition/ApiStores'
import { NotFoundError } from '../../src/domain/errors/NotFoundError'
import { userPartitionKey } from '../../src/storage/dynamodb/keys/partitionKeys'
import { SETTINGS_SORT_KEY } from '../../src/storage/dynamodb/keys/sortKeys'
import { createLocalTable, DYNAMODB_LOCAL_ENDPOINT, type LocalTable } from '../helpers/dynamoLocal'

const RULE = { id: 'site~example.com', targetType: 'site', target: 'example.com', mode: 'always', windows: [] } as const

const REMOVAL: PendingRuleChange = {
  id: RULE.id,
  ruleId: RULE.id,
  kind: 'delete',
  mode: null,
  windows: null,
  effectiveAt: '2026-11-12T12:00:00.000Z',
}

describe.skipIf(!DYNAMODB_LOCAL_ENDPOINT)('DynamoDB stores', () => {
  let table: LocalTable
  let stores: ApiStores

  beforeEach(async () => {
    table = await createLocalTable(DYNAMODB_LOCAL_ENDPOINT ?? '')
    stores = createDynamoStores(table.context)
  })
  afterEach(async () => {
    await table.dropTable()
  })

  it('refuses to store a pending change for a rule that does not exist', async () => {
    await expect(stores.pendingChangeStore.save('user-1', REMOVAL)).rejects.toBeInstanceOf(NotFoundError)
    expect(await stores.pendingChangeStore.listChangesByUser('user-1')).toEqual([])
  })

  it('keeps the rule when the pending change was replaced before it was applied', async () => {
    await stores.blockRuleStore.insert('user-1', RULE)
    await stores.pendingChangeStore.save('user-1', REMOVAL)
    await stores.pendingChangeStore.save('user-1', { ...REMOVAL, effectiveAt: '2026-11-13T12:00:00.000Z' })
    expect(await stores.dueChangeApplier.applyDueChange('user-1', REMOVAL)).toBe(false)
    expect(await stores.blockRuleStore.findById('user-1', RULE.id)).toEqual(RULE)
  })

  it.each([-5, 9999, 1.5, 'soon'])('falls back to 24 hours when the stored cooldown is %s', async (stored) => {
    await table.context.client.send(
      new PutCommand({
        TableName: table.context.tableName,
        Item: { pk: userPartitionKey('user-1'), sk: SETTINGS_SORT_KEY, cooldownHours: stored },
      }),
    )
    expect(await stores.cooldownSettingsStore.readCooldownHours('user-1')).toBe(24)
  })
})
