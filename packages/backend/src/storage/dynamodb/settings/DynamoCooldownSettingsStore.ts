import { GetCommand } from '@aws-sdk/lib-dynamodb'
import type { CooldownSettingsStore } from '../../../cooldown/contracts/CooldownSettingsStore'
import { userPartitionKey } from '../keys/partitionKeys'
import { SETTINGS_SORT_KEY } from '../keys/sortKeys'
import type { TableContext } from '../TableContext'

const DEFAULT_COOLDOWN_HOURS = 24

export class DynamoCooldownSettingsStore implements CooldownSettingsStore {
  constructor(private readonly context: TableContext) {}

  async readCooldownHours(userId: string): Promise<number> {
    const { Item } = await this.context.client.send(
      new GetCommand({
        TableName: this.context.tableName,
        Key: { pk: userPartitionKey(userId), sk: SETTINGS_SORT_KEY },
      }),
    )
    const cooldownHours = Item?.['cooldownHours']
    return typeof cooldownHours === 'number' ? cooldownHours : DEFAULT_COOLDOWN_HOURS
  }
}
