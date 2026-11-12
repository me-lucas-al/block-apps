import { ValidationError } from '../../../domain/errors/ValidationError'
import type { DeviceStatus } from '../../../devices/contracts/DeviceStore'
import { readNullableBooleanField } from '../fields/readNullableBooleanField'

const DEVICE_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/

export function parseDeviceStatusBody(
  deviceId: string,
  body: Record<string, unknown>,
): DeviceStatus {
  if (!DEVICE_ID_PATTERN.test(deviceId)) {
    throw new ValidationError('deviceId must have 1 to 128 letters, digits, dots, hyphens or underscores')
  }
  const platform = body['platform']
  if (platform !== 'android' && platform !== 'ios' && platform !== 'extension') {
    throw new ValidationError('platform must be android, ios or extension')
  }
  return {
    deviceId,
    platform,
    incognitoAllowed: readNullableBooleanField(body, 'incognitoAllowed'),
    adminActive: readNullableBooleanField(body, 'adminActive'),
  }
}
