import { GetCommand } from '@aws-sdk/lib-dynamodb'
import type { CooldownSettingsStore } from '../../../cooldown/contracts/CooldownSettingsStore'
import { userPartitionKey } from '../keys/partitionKeys'
import { SETTINGS_SORT_KEY } from '../keys/sortKeys'
import type { TableContext } from '../TableContext'

const DEFAULT_COOLDOWN_HOURS = 24
const MAX_COOLDOWN_HOURS = 168

function isValidCooldownHours(cooldownHours: unknown): cooldownHours is number {
  return (
    typeof cooldownHours === 'number' &&
    Number.isInteger(cooldownHours) &&
    cooldownHours >= 0 &&
    cooldownHours <= MAX_COOLDOWN_HOURS
  )
}

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
    return isValidCooldownHours(cooldownHours) ? cooldownHours : DEFAULT_COOLDOWN_HOURS
  }
}
