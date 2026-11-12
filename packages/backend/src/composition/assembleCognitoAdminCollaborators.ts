import { CognitoUserCreator } from '../storage/cognito/CognitoUserCreator'
import type { CognitoContext } from '../storage/cognito/CognitoContext'
import { CognitoUserEditor } from '../storage/cognito/CognitoUserEditor'
import { CognitoUserReader } from '../storage/cognito/CognitoUserReader'
import { CognitoUserRemover } from '../storage/cognito/CognitoUserRemover'
import type { AdminCollaborators } from './createAdminUseCases'

export type UserSettingsCollaborators = Pick<
  AdminCollaborators,
  'userDataEraser' | 'cooldownSettingsStore' | 'cooldownSettingsWriter'
>

export function assembleCognitoAdminCollaborators(
  cognito: CognitoContext,
  settings: UserSettingsCollaborators,
): AdminCollaborators {
  return {
    userReader: new CognitoUserReader(cognito),
    userCreator: new CognitoUserCreator(cognito),
    userEditor: new CognitoUserEditor(cognito),
    userRemover: new CognitoUserRemover(cognito),
    ...settings,
  }
}
