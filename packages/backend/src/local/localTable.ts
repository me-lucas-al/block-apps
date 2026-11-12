import {
  CreateTableCommand,
  DynamoDBClient,
  type CreateTableCommandInput,
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { DUE_CHANGES_INDEX_NAME } from '../storage/dynamodb/keys/partitionKeys'
import type { TableContext } from '../storage/dynamodb/TableContext'

export function buildTableDefinition(tableName: string): CreateTableCommandInput {
  return {
    TableName: tableName,
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'pk', AttributeType: 'S' },
      { AttributeName: 'sk', AttributeType: 'S' },
      { AttributeName: 'dueBucket', AttributeType: 'S' },
      { AttributeName: 'effectiveAt', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'pk', KeyType: 'HASH' },
      { AttributeName: 'sk', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: DUE_CHANGES_INDEX_NAME,
        KeySchema: [
          { AttributeName: 'dueBucket', KeyType: 'HASH' },
          { AttributeName: 'effectiveAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  }
}

export function createLocalDynamoClient(endpoint: string): DynamoDBClient {
  return new DynamoDBClient({
    endpoint,
    region: 'local',
    credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
  })
}

export async function ensureLocalTable(endpoint: string, tableName: string): Promise<TableContext> {
  const rawClient = createLocalDynamoClient(endpoint)
  try {
    await rawClient.send(new CreateTableCommand(buildTableDefinition(tableName)))
  } catch (error: unknown) {
    if (!(error instanceof Error) || error.name !== 'ResourceInUseException') throw error
  }
  const client = DynamoDBDocumentClient.from(rawClient, {
    marshallOptions: { removeUndefinedValues: true },
  })
  return { client, tableName }
}

const RETRY_DELAY_MILLISECONDS = 1000
const TABLE_READY_MAX_ATTEMPTS = 30

function waitBeforeRetry(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MILLISECONDS))
}

export async function ensureLocalTableWhenReady(
  endpoint: string,
  tableName: string,
): Promise<TableContext> {
  for (let attempt = 1; attempt < TABLE_READY_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await ensureLocalTable(endpoint, tableName)
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : 'unknown error'
      console.log(`Waiting for DynamoDB at ${endpoint} (attempt ${attempt}): ${reason}`)
      await waitBeforeRetry()
    }
  }
  return ensureLocalTable(endpoint, tableName)
}
