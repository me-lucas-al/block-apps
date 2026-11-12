import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { CooldownSettingsWriter } from '../../../users/contracts/CooldownSettingsWriter'
import { userPartitionKey } from '../keys/partitionKeys'
import { SETTINGS_SORT_KEY } from '../keys/sortKeys'
import type { TableContext } from '../TableContext'

export class DynamoCooldownSettingsWriter implements CooldownSettingsWriter {
  constructor(private readonly context: TableContext) {}

  async writeCooldownHours(userId: string, cooldownHours: number): Promise<void> {
    await this.context.client.send(
      new UpdateCommand({
        TableName: this.context.tableName,
        Key: { pk: userPartitionKey(userId), sk: SETTINGS_SORT_KEY },
        UpdateExpression: 'SET cooldownHours = :cooldownHours',
        ExpressionAttributeValues: { ':cooldownHours': cooldownHours },
      }),
    )
  }
}
