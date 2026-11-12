import { PutCommand } from '@aws-sdk/lib-dynamodb'
import type { DeviceStatus, DeviceStore } from '../../../devices/contracts/DeviceStore'
import { userPartitionKey } from '../keys/partitionKeys'
import { deviceSortKey } from '../keys/sortKeys'
import type { TableContext } from '../TableContext'

export class DynamoDeviceStore implements DeviceStore {
  constructor(private readonly context: TableContext) {}

  async saveStatus(userId: string, status: DeviceStatus, reportedAt: string): Promise<void> {
    await this.context.client.send(
      new PutCommand({
        TableName: this.context.tableName,
        Item: {
          pk: userPartitionKey(userId),
          sk: deviceSortKey(status.deviceId),
          ...status,
          lastSeen: reportedAt,
        },
      }),
    )
  }
}
