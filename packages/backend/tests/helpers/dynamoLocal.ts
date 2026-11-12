import { DynamoDBClient, CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'node:crypto'
import { DUE_CHANGES_INDEX_NAME } from '../../src/storage/dynamodb/keys/partitionKeys'
import type { TableContext } from '../../src/storage/dynamodb/TableContext'

export const DYNAMODB_LOCAL_ENDPOINT = process.env['DYNAMODB_ENDPOINT']

export type LocalTable = {
  readonly context: TableContext
  dropTable(): Promise<void>
}

export async function createLocalTable(endpoint: string): Promise<LocalTable> {
  const rawClient = new DynamoDBClient({
    endpoint,
    region: 'local',
    credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
  })
  const tableName = `block-apps-test-${randomUUID()}`
  await rawClient.send(
    new CreateTableCommand({
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
    }),
  )
  const client = DynamoDBDocumentClient.from(rawClient, {
    marshallOptions: { removeUndefinedValues: true },
  })
  return {
    context: { client, tableName },
    dropTable: async () => {
      await rawClient.send(new DeleteTableCommand({ TableName: tableName }))
    },
  }
}
