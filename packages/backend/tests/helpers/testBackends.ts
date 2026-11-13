import { PutCommand } from '@aws-sdk/lib-dynamodb'
import type { Hono } from 'hono'
import { createApiUseCases } from '../../src/composition/createApiUseCases'
import { createDynamoStores } from '../../src/composition/createDynamoStores'
import { ApplyAllDueChangesUseCase } from '../../src/cooldown/use-cases/ApplyAllDueChangesUseCase'
import { ApplyDueChangesForUserUseCase } from '../../src/cooldown/use-cases/ApplyDueChangesForUserUseCase'
import type { ApiEnv } from '../../src/http/app/ApiEnv'
import { createApiApp } from '../../src/http/app/createApiApp'
import { userPartitionKey } from '../../src/storage/dynamodb/keys/partitionKeys'
import { SETTINGS_SORT_KEY } from '../../src/storage/dynamodb/keys/sortKeys'
import type { ApiStores } from '../../src/composition/ApiStores'
import { createLocalTable, DYNAMODB_LOCAL_ENDPOINT } from './dynamoLocal'
import { FakeClock } from './FakeClock'
import { InMemoryRuleDatabase } from './InMemoryRuleDatabase'

export type TestBackend = {
  readonly app: Hono<ApiEnv>
  readonly clock: FakeClock
  applyAllDueChanges(): Promise<number>
  setCooldownHours(userId: string, cooldownHours: number): Promise<void>
  dispose(): Promise<void>
}

export type BackendFactory = {
  readonly name: string
  create(maxRulesPerUser?: number): Promise<TestBackend>
}

function assembleBackend(
  stores: ApiStores,
  clock: FakeClock,
  maxRulesPerUser: number | undefined,
  setCooldownHours: TestBackend['setCooldownHours'],
  dispose: TestBackend['dispose'],
): TestBackend {
  const useCases = createApiUseCases(stores, clock.now, maxRulesPerUser)
  const applyAll = new ApplyAllDueChangesUseCase(
    stores.pendingChangeStore,
    new ApplyDueChangesForUserUseCase(stores.pendingChangeStore, stores.dueChangeApplier, clock.now),
    clock.now,
  )
  return {
    app: createApiApp(useCases),
    clock,
    applyAllDueChanges: () => applyAll.applyAllDueChanges(),
    setCooldownHours,
    dispose,
  }
}

const inMemoryFactory: BackendFactory = {
  name: 'in-memory',
  create: async (maxRulesPerUser) => {
    const database = new InMemoryRuleDatabase()
    const stores: ApiStores = {
      blockRuleStore: database,
      pendingChangeStore: database,
      dueChangeApplier: database,
      cooldownSettingsStore: database,
      deviceStore: database,
    }
    const setCooldownHours = async (userId: string, cooldownHours: number) => {
      database.setCooldownHours(userId, cooldownHours)
    }
    return assembleBackend(stores, new FakeClock(), maxRulesPerUser, setCooldownHours, async () => {})
  },
}

function buildDynamoFactory(endpoint: string): BackendFactory {
  return {
    name: 'dynamodb-local',
    create: async (maxRulesPerUser) => {
      const table = await createLocalTable(endpoint)
      const setCooldownHours = async (userId: string, cooldownHours: number) => {
        await table.context.client.send(
          new PutCommand({
            TableName: table.context.tableName,
            Item: { pk: userPartitionKey(userId), sk: SETTINGS_SORT_KEY, cooldownHours },
          }),
        )
      }
      return assembleBackend(
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
