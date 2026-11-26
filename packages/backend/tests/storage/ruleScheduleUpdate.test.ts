import type { BlockRule } from '@block-apps/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDynamoStores } from '../../src/composition/createDynamoStores'
import { ConflictError } from '../../src/domain/errors/ConflictError'
import { NotFoundError } from '../../src/domain/errors/NotFoundError'
import type { BlockRuleStore } from '../../src/rules/contracts/BlockRuleStore'
import { createLocalTable, DYNAMODB_LOCAL_ENDPOINT, type LocalTable } from '../helpers/dynamoLocal'
import { InMemoryRuleDatabase } from '../helpers/InMemoryRuleDatabase'

const WORKDAY = { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' } as const
const SHORTER = { days: [1, 2, 3, 4, 5], start: '10:00', end: '16:00' } as const
const SCHEDULED_RULE: BlockRule = {
  id: 'site~example.com',
  targetType: 'site',
  target: 'example.com',
  mode: 'schedule',
  windows: [WORKDAY],
}

type StoreFactory = { readonly name: string; readonly skip: boolean; create(): Promise<BlockRuleStore> }

let localTable: LocalTable | undefined

const storeFactories: StoreFactory[] = [
  { name: 'in-memory', skip: false, create: async () => new InMemoryRuleDatabase() },
  {
    name: 'DynamoDB local',
    skip: !DYNAMODB_LOCAL_ENDPOINT,
    create: async () => {
      localTable = await createLocalTable(DYNAMODB_LOCAL_ENDPOINT ?? '')
      return createDynamoStores(localTable.context).blockRuleStore
    },
  },
]

describe.each(storeFactories)('BlockRuleStore.updateSchedule ($name)', (factory) => {
  let store: BlockRuleStore

  beforeEach(async () => {
    if (factory.skip) return
    store = await factory.create()
  })
  afterEach(async () => {
    await localTable?.dropTable()
    localTable = undefined
  })

  it.skipIf(factory.skip)('writes the requested schedule and returns the updated rule', async () => {
    await store.insert('user-1', SCHEDULED_RULE)
    const updated = await store.updateSchedule('user-1', SCHEDULED_RULE, { mode: 'schedule', windows: [SHORTER] })
    expect(updated).toEqual({ ...SCHEDULED_RULE, windows: [SHORTER] })
    expect(await store.findById('user-1', SCHEDULED_RULE.id)).toEqual(updated)
  })

  it.skipIf(factory.skip)('refuses to overwrite a schedule that changed after it was read', async () => {
    await store.insert('user-1', SCHEDULED_RULE)
    await store.updateSchedule('user-1', SCHEDULED_RULE, { mode: 'always', windows: [] })
    const staleUpdate = store.updateSchedule('user-1', SCHEDULED_RULE, { mode: 'schedule', windows: [SHORTER] })
    await expect(staleUpdate).rejects.toBeInstanceOf(ConflictError)
    expect(await store.findById('user-1', SCHEDULED_RULE.id)).toMatchObject({ mode: 'always' })
  })

  it.skipIf(factory.skip)('refuses to create a rule that does not exist', async () => {
    const missingUpdate = store.updateSchedule('user-1', SCHEDULED_RULE, { mode: 'always', windows: [] })
    await expect(missingUpdate).rejects.toBeInstanceOf(NotFoundError)
    expect(await store.findById('user-1', SCHEDULED_RULE.id)).toBeNull()
  })
})
