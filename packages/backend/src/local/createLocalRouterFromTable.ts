import { createAdminUseCases } from '../composition/createAdminUseCases'
import { createApiUseCases } from '../composition/createApiUseCases'
import { createDynamoStores } from '../composition/createDynamoStores'
import { createAdminApp } from '../http/app/createAdminApp'
import { createApiApp } from '../http/app/createApiApp'
import { CognitoUserCreator } from '../storage/cognito/CognitoUserCreator'
import { CognitoUserEditor } from '../storage/cognito/CognitoUserEditor'
import { CognitoUserReader } from '../storage/cognito/CognitoUserReader'
import { CognitoUserRemover } from '../storage/cognito/CognitoUserRemover'
import { DynamoCooldownSettingsStore } from '../storage/dynamodb/settings/DynamoCooldownSettingsStore'
import { DynamoCooldownSettingsWriter } from '../storage/dynamodb/settings/DynamoCooldownSettingsWriter'
import type { TableContext } from '../storage/dynamodb/TableContext'
import { DynamoUserDataEraser } from '../storage/dynamodb/users/DynamoUserDataEraser'
import { createLocalRouter } from './createLocalRouter'
import { seedLocalUsers } from './seedLocalUsers'

export function createLocalRouterFromTable(table: TableContext) {
  const cognitoContext = seedLocalUsers().asContext()
  const adminUseCases = createAdminUseCases({
    userReader: new CognitoUserReader(cognitoContext),
    userCreator: new CognitoUserCreator(cognitoContext),
    userEditor: new CognitoUserEditor(cognitoContext),
    userRemover: new CognitoUserRemover(cognitoContext),
    userDataEraser: new DynamoUserDataEraser(table),
    cooldownSettingsStore: new DynamoCooldownSettingsStore(table),
    cooldownSettingsWriter: new DynamoCooldownSettingsWriter(table),
  })
  const apiUseCases = createApiUseCases(createDynamoStores(table), () => new Date())
  return createLocalRouter(createApiApp(apiUseCases), createAdminApp('admin', adminUseCases))
}
