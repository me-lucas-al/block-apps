import { AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import type { UserRemover } from '../../users/contracts/UserRemover'
import type { CognitoContext } from './CognitoContext'
import { withTranslatedErrors } from './translateCognitoError'

export class CognitoUserRemover implements UserRemover {
  constructor(private readonly context: CognitoContext) {}

  remove(username: string): Promise<void> {
    return withTranslatedErrors(async () => {
      await this.context.client.send(
        new AdminDeleteUserCommand({ UserPoolId: this.context.userPoolId, Username: username }),
      )
    })
  }
}
