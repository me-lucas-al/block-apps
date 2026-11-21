import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { createDynamoStores } from '../../../src/composition/createDynamoStores'
import { DEFAULT_MAX_RULES_PER_USER } from '../../../src/rules/quota/readMaxRulesPerUser'
import { dnsTokenLookupKey } from '../../../src/storage/dynamodb/dns/items/dnsKeys'
import { userPartitionKey } from '../../../src/storage/dynamodb/keys/partitionKeys'
import { SETTINGS_SORT_KEY } from '../../../src/storage/dynamodb/keys/sortKeys'
import { createLocalTable } from '../dynamoLocal'
import { FakeClock } from '../FakeClock'
import type { BackendFactory } from '../testBackends'
import { assembleBackend } from './assembleBackend'

export function buildDynamoBackendFactory(endpoint: string): BackendFactory {
  return {
    name: 'dynamodb-local',
    create: async (maxRulesPerUser = DEFAULT_MAX_RULES_PER_USER) => {
      const table = await createLocalTable(endpoint)
      const { client, tableName } = table.context
      return assembleBackend(
        createDynamoStores(table.context),
        new FakeClock(),
        maxRulesPerUser,
        {
          setCooldownHours: async (userId, cooldownHours) => {
            await client.send(
              new PutCommand({
                TableName: tableName,
                Item: { pk: userPartitionKey(userId), sk: SETTINGS_SORT_KEY, cooldownHours },
              }),
            )
          },
          plantOrphanTokenLookup: async (userId, tokenHash) => {
            await client.send(
              new PutCommand({
                TableName: tableName,
                Item: { ...dnsTokenLookupKey(tokenHash), userId },
              }),
            )
          },
          dispose: table.dropTable,
        },
      )
    },
  }
}
