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
}

const PASSWORD_CHANGE_STATUSES = new Set(['FORCE_CHANGE_PASSWORD', 'RESET_REQUIRED'])

function readAttribute(record: CognitoUserRecord, attributeName: string): string | null {
  const attributes = record.Attributes ?? record.UserAttributes ?? []
  return attributes.find((attribute) => attribute.Name === attributeName)?.Value ?? null
}

export function mapDirectoryUser(record: CognitoUserRecord, role: UserRole): DirectoryUser {
  return {
    id: record.Username ?? '',
    email: readAttribute(record, 'email') ?? '',
    displayName: readAttribute(record, 'name'),
    role,
    enabled: record.Enabled ?? false,
    mustChangePassword: PASSWORD_CHANGE_STATUSES.has(record.UserStatus ?? ''),
    createdAt: (record.UserCreateDate ?? new Date(0)).toISOString(),
  }
}
