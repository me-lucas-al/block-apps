import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

type DynamoCommand = Parameters<DynamoDBDocumentClient['send']>[0]

export type DynamoClientHooks = {
  readonly beforeSend?: (command: DynamoCommand) => Promise<void>
  readonly afterSend?: (command: DynamoCommand) => Promise<void>
}

export function interceptDynamoClient(
  client: DynamoDBDocumentClient,
  hooks: DynamoClientHooks,
): DynamoDBDocumentClient {
  const interceptingClient = {
    send: async (command: DynamoCommand) => {
      await hooks.beforeSend?.(command)
      const response = await client.send(command)
      await hooks.afterSend?.(command)
      return response
    },
  }
  return interceptingClient as unknown as DynamoDBDocumentClient
}
