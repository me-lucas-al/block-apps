import { CognitoUserPool } from 'amazon-cognito-identity-js'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { CognitoConfig } from './CognitoConfig'
import { createSignedInUser } from './createSignedInUser'

export class CognitoPasswordChange {
  private readonly userPool: CognitoUserPool

  constructor(config: CognitoConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId,
    })
  }

  change(tokens: SessionTokens, currentPassword: string, newPassword: string): Promise<void> {
    const user = createSignedInUser(this.userPool, tokens)
    return new Promise((resolve, reject) => {
      user.changePassword(currentPassword, newPassword, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
