import type { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import type { UserRole } from '../../users/model/AdminUser'

export type CognitoContext = {
  readonly client: CognitoIdentityProviderClient
  readonly userPoolId: string
  readonly groupNames: Readonly<Record<UserRole, string>>
}
