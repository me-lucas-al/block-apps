import { CognitoUserPool } from 'amazon-cognito-identity-js'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { CognitoConfig } from './CognitoConfig'
import { createSignedInUser } from './createSignedInUser'

export class CognitoTotpEnrollment {
  private readonly userPool: CognitoUserPool

  constructor(config: CognitoConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId,
    })
  }

  begin(tokens: SessionTokens): Promise<string> {
    const user = createSignedInUser(this.userPool, tokens)
    return new Promise((resolve, reject) => {
      user.associateSoftwareToken({
        associateSecretCode: (secretCode: string) => resolve(secretCode),
        onFailure: (err) => reject(err),
      })
    })
  }

  confirm(tokens: SessionTokens, totpCode: string): Promise<void> {
    const user = createSignedInUser(this.userPool, tokens)
    return new Promise((resolve, reject) => {
      user.verifySoftwareToken(totpCode, 'authenticator', {
        onSuccess: () => {
          user.setUserMfaPreference(null, { PreferredMfa: true, Enabled: true }, (err) => {
            if (err) reject(err)
            else resolve()
          })
        },
        onFailure: (err) => reject(err),
      })
    })
  }
}
