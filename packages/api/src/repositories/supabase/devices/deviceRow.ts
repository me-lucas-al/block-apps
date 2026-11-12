import type { DeviceStatus } from '../../contracts/DeviceRepository'

export type DeviceRow = {
  id: string
  platform: DeviceStatus['platform']
  incognito_allowed: boolean | null
  admin_active: boolean | null
  last_seen: string
}

export function toDeviceRow(status: DeviceStatus, seenAt: Date): DeviceRow {
  return {
    id: status.deviceId,
    platform: status.platform,
    incognito_allowed: status.incognitoAllowed,
    admin_active: status.adminActive,
    last_seen: seenAt.toISOString(),
  }
}
