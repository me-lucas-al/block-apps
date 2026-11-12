import { CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'node:crypto'
import { buildTableDefinition, createLocalDynamoClient } from '../../src/local/localTable'
import type { TableContext } from '../../src/storage/dynamodb/TableContext'

export const DYNAMODB_LOCAL_ENDPOINT = process.env['DYNAMODB_ENDPOINT']

export type LocalTable = {
  readonly context: TableContext
  dropTable(): Promise<void>
}

export async function createLocalTable(endpoint: string): Promise<LocalTable> {
  const rawClient = createLocalDynamoClient(endpoint)
  const tableName = `block-apps-test-${randomUUID()}`
  await rawClient.send(new CreateTableCommand(buildTableDefinition(tableName)))
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
