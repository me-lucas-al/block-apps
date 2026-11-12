import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export type TableContext = {
  readonly client: DynamoDBDocumentClient
  readonly tableName: string
}
