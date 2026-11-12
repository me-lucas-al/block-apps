import { QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import type { TableContext } from './TableContext'

export async function queryAllPages(
  context: TableContext,
  input: Omit<QueryCommandInput, 'TableName' | 'ExclusiveStartKey'>,
): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = []
  let startKey: Record<string, unknown> | undefined
  do {
    const page = await context.client.send(
      new QueryCommand({ ...input, TableName: context.tableName, ExclusiveStartKey: startKey }),
    )
    items.push(...(page.Items ?? []))
    startKey = page.LastEvaluatedKey
  } while (startKey)
  return items
}
