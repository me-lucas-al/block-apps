import type { AttributeType } from '@aws-sdk/client-cognito-identity-provider'
import type { UserRole } from '../../users/model/AdminUser'
import type { DirectoryUser } from '../../users/model/DirectoryUser'

export type CognitoUserRecord = {
  readonly Username?: string
  readonly Attributes?: AttributeType[]
  readonly UserAttributes?: AttributeType[]
  readonly Enabled?: boolean
  readonly UserStatus?: string
  readonly UserCreateDate?: Date
  readonly UserMFASettingList?: readonly string[]
  readonly PreferredMfaSetting?: string
}

const PASSWORD_CHANGE_STATUSES = new Set(['FORCE_CHANGE_PASSWORD', 'RESET_REQUIRED'])

export function readCognitoAttribute(record: CognitoUserRecord, attributeName: string): string | null {
  const attributes = record.Attributes ?? record.UserAttributes ?? []
  return attributes.find((attribute) => attribute.Name === attributeName)?.Value ?? null
}

export function mapDirectoryUser(record: CognitoUserRecord, role: UserRole): DirectoryUser {
  const username = record.Username ?? ''
  const mfaSettings = record.UserMFASettingList ?? []
  const mfaActive = mfaSettings.includes('SOFTWARE_TOKEN_MFA') || record.PreferredMfaSetting === 'SOFTWARE_TOKEN_MFA'
  return {
    id: readCognitoAttribute(record, 'sub') ?? username,
    username,
    email: readCognitoAttribute(record, 'email') ?? '',
    displayName: readCognitoAttribute(record, 'name'),
    role,
    enabled: record.Enabled ?? false,
    federated: record.UserStatus === 'EXTERNAL_PROVIDER',
    mustChangePassword: PASSWORD_CHANGE_STATUSES.has(record.UserStatus ?? ''),
    mfaActive,
    createdAt: (record.UserCreateDate ?? new Date(0)).toISOString(),
  }
}
