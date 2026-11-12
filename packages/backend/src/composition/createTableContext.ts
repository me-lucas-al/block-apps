import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import type { TableContext } from '../storage/dynamodb/TableContext'
import { readRequiredEnvironment } from './readRequiredEnvironment'

export function createTableContext(): TableContext {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
    marshallOptions: { removeUndefinedValues: true },
  })
  return { client, tableName: readRequiredEnvironment('TABLE_NAME') }
}
