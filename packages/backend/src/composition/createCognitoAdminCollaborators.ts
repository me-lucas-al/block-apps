import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'
import { CognitoUserReader } from '../storage/cognito/CognitoUserReader'
import { CognitoUserWriter } from '../storage/cognito/CognitoUserWriter'
import { DynamoCooldownSettingsStore } from '../storage/dynamodb/settings/DynamoCooldownSettingsStore'
import { DynamoCooldownSettingsWriter } from '../storage/dynamodb/settings/DynamoCooldownSettingsWriter'
import { DynamoUserDataEraser } from '../storage/dynamodb/users/DynamoUserDataEraser'
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
  return {
    userReader: new CognitoUserReader(cognito),
    userWriter: new CognitoUserWriter(cognito),
    userDataEraser: new DynamoUserDataEraser(table),
    cooldownSettingsStore: new DynamoCooldownSettingsStore(table),
    cooldownSettingsWriter: new DynamoCooldownSettingsWriter(table),
  }
}
