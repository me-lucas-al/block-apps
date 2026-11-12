import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { CognitoConfig } from './CognitoConfig'

export class CognitoTotpEnrollment {
  private readonly userPool: CognitoUserPool

  constructor(config: CognitoConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId,
    })
  }

  begin(tokens: SessionTokens): Promise<string> {
    const user = this.signedInUser(tokens)
    return new Promise((resolve, reject) => {
      user.associateSoftwareToken({
        associateSecretCode: (secretCode: string) => resolve(secretCode),
        onFailure: (err) => reject(err),
      })
    })
  }

  confirm(tokens: SessionTokens, totpCode: string): Promise<void> {
    const user = this.signedInUser(tokens)
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

  private signedInUser(tokens: SessionTokens): CognitoUser {
    const user = new CognitoUser({ Username: tokens.email, Pool: this.userPool })
    user.setSignInUserSession(
      new CognitoUserSession({
        IdToken: new CognitoIdToken({ IdToken: tokens.idToken }),
        AccessToken: new CognitoAccessToken({ AccessToken: tokens.accessToken }),
        RefreshToken: new CognitoRefreshToken({ RefreshToken: tokens.refreshToken }),
      }),
    )
    return user
  }
}
