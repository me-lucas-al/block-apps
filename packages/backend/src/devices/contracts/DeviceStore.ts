export type DevicePlatform = 'android' | 'ios' | 'extension'

export type DeviceStatus = {
  readonly deviceId: string
  readonly platform: DevicePlatform
  readonly incognitoAllowed: boolean | null
  readonly adminActive: boolean | null
}

export interface DeviceStore {
  saveStatus(userId: string, status: DeviceStatus, reportedAt: string): Promise<void>
}
