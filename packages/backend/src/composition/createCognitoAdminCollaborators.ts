import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { DynamoCooldownSettingsStore } from '../storage/dynamodb/settings/DynamoCooldownSettingsStore'
import { DynamoCooldownSettingsWriter } from '../storage/dynamodb/settings/DynamoCooldownSettingsWriter'
import { DynamoUserDataEraser } from '../storage/dynamodb/users/DynamoUserDataEraser'
import { assembleCognitoAdminCollaborators } from './assembleCognitoAdminCollaborators'
import type { AdminCollaborators } from './createAdminUseCases'
import { createTableContext } from './createTableContext'
import { readRequiredEnvironment } from './readRequiredEnvironment'

export function createCognitoAdminCollaborators(): AdminCollaborators {
  const cognito = {
    client: new CognitoIdentityProviderClient({}),
    userPoolId: readRequiredEnvironment('USER_POOL_ID'),
    groupNames: {
      admin: readRequiredEnvironment('ADMIN_GROUP_NAME'),
      user: readRequiredEnvironment('USER_GROUP_NAME'),
    },
  }
  const table = createTableContext()
  return assembleCognitoAdminCollaborators(cognito, {
    userDataEraser: new DynamoUserDataEraser(table),
    cooldownSettingsStore: new DynamoCooldownSettingsStore(table),
    cooldownSettingsWriter: new DynamoCooldownSettingsWriter(table),
  })
}
