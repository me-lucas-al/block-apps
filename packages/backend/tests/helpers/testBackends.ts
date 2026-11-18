import { PutCommand } from '@aws-sdk/lib-dynamodb'
import type { ApiStores } from '../../src/composition/ApiStores'
import { createDynamoStores } from '../../src/composition/createDynamoStores'
import { DEFAULT_MAX_RULES_PER_USER } from '../../src/rules/quota/readMaxRulesPerUser'
import { userPartitionKey } from '../../src/storage/dynamodb/keys/partitionKeys'
import { SETTINGS_SORT_KEY } from '../../src/storage/dynamodb/keys/sortKeys'
import { assembleTestBackend, type TestBackend } from './assembleTestBackend'
import { createLocalTable, DYNAMODB_LOCAL_ENDPOINT } from './dynamoLocal'
import { FakeClock } from './FakeClock'
import { InMemoryRuleDatabase } from './InMemoryRuleDatabase'

export type { TestBackend }

export type BackendFactory = {
  readonly name: string
  create(maxRulesPerUser?: number): Promise<TestBackend>
}

const inMemoryFactory: BackendFactory = {
  name: 'in-memory',
  create: async (maxRulesPerUser = DEFAULT_MAX_RULES_PER_USER) => {
    const database = new InMemoryRuleDatabase()
    const stores: ApiStores = {
      blockRuleStore: database,
      pendingChangeStore: database,
      dueChangeApplier: database,
      cooldownSettingsStore: database,
      deviceStore: database,
      dnsSettingsStore: database,
    }
    const setCooldownHours = async (userId: string, cooldownHours: number) => {
      database.setCooldownHours(userId, cooldownHours)
    }
    return assembleTestBackend(stores, new FakeClock(), maxRulesPerUser, setCooldownHours, async () => {})
  },
}

function buildDynamoFactory(endpoint: string): BackendFactory {
  return {
    name: 'dynamodb-local',
    create: async (maxRulesPerUser = DEFAULT_MAX_RULES_PER_USER) => {
      const table = await createLocalTable(endpoint)
      const setCooldownHours = async (userId: string, cooldownHours: number) => {
        await table.context.client.send(
          new PutCommand({
            TableName: table.context.tableName,
            Item: { pk: userPartitionKey(userId), sk: SETTINGS_SORT_KEY, cooldownHours },
          }),
        )
      }
      return assembleTestBackend(
        createDynamoStores(table.context),
        new FakeClock(),
        maxRulesPerUser,
        setCooldownHours,
        table.dropTable,
      )
    },
  }
}

export const backendFactories: BackendFactory[] = DYNAMODB_LOCAL_ENDPOINT
  ? [inMemoryFactory, buildDynamoFactory(DYNAMODB_LOCAL_ENDPOINT)]
  : [inMemoryFactory]
