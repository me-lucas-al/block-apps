import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDynamoStores } from '../../src/composition/createDynamoStores'
import type { ApiStores } from '../../src/composition/ApiStores'
import { DynamoCooldownSettingsWriter } from '../../src/storage/dynamodb/settings/DynamoCooldownSettingsWriter'
import { DynamoUserDataEraser } from '../../src/storage/dynamodb/users/DynamoUserDataEraser'
import { createLocalTable, DYNAMODB_LOCAL_ENDPOINT, type LocalTable } from '../helpers/dynamoLocal'

const SITE_RULE = { id: 'site~a.com', targetType: 'site', target: 'a.com', mode: 'always', windows: [] } as const

describe.skipIf(!DYNAMODB_LOCAL_ENDPOINT)('DynamoDB user administration stores', () => {
  let table: LocalTable
  let stores: ApiStores

  beforeEach(async () => {
    table = await createLocalTable(DYNAMODB_LOCAL_ENDPOINT ?? '')
    stores = createDynamoStores(table.context)
  })
  afterEach(async () => {
    await table.dropTable()
  })

  it('writes a cooldown that the reader returns', async () => {
    await new DynamoCooldownSettingsWriter(table.context).writeCooldownHours('user-1', 72)
    expect(await stores.cooldownSettingsStore.readCooldownHours('user-1')).toBe(72)
  })

  it('erases every item of one user and leaves the others', async () => {
    await stores.blockRuleStore.insert('user-1', SITE_RULE)
    await stores.deviceStore.saveStatus(
      'user-1',
      { deviceId: 'd1', platform: 'android', incognitoAllowed: null, adminActive: true },
      '2026-11-11T12:00:00.000Z',
    )
    await new DynamoCooldownSettingsWriter(table.context).writeCooldownHours('user-1', 1)
    await stores.blockRuleStore.insert('user-2', SITE_RULE)

    await new DynamoUserDataEraser(table.context).eraseAllDataOf('user-1')

    expect(await stores.blockRuleStore.listRulesByUser('user-1')).toEqual([])
    expect(await stores.cooldownSettingsStore.readCooldownHours('user-1')).toBe(24)
    expect(await stores.blockRuleStore.listRulesByUser('user-2')).toEqual([SITE_RULE])
  })

  it('erases more than one batch of items', async () => {
    for (let index = 0; index < 60; index += 1) {
      await stores.blockRuleStore.insert('user-1', { ...SITE_RULE, id: `site~s${index}.com`, target: `s${index}.com` })
    }
    await new DynamoUserDataEraser(table.context).eraseAllDataOf('user-1')
    expect(await stores.blockRuleStore.listRulesByUser('user-1')).toEqual([])
  })
})
