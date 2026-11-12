import type { CognitoUserSession } from 'amazon-cognito-identity-js'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { CognitoSrpAuth } from './CognitoSrpAuth'
import { extractSessionTokens } from './extractSessionTokens'

export class CognitoChallengeResolver {
  constructor(private readonly srpAuth: CognitoSrpAuth) {}

  completeNewPassword(newPassword: string): Promise<SessionTokens> {
    const user = this.srpAuth.getPendingUser()
    const email = this.srpAuth.getActiveEmail()
    return new Promise((resolve, reject) => {
      user.completeNewPasswordChallenge(newPassword, {}, {
        onSuccess: (session: CognitoUserSession) => {
          this.srpAuth.clearPendingUser()
          resolve(extractSessionTokens(session, email))
        },
        onFailure: (err) => reject(err),
      })
    })
  }

  sendTotpCode(totpCode: string): Promise<SessionTokens> {
    const user = this.srpAuth.getPendingUser()
    const email = this.srpAuth.getActiveEmail()
    return new Promise((resolve, reject) => {
      user.sendMFACode(
        totpCode,
        {
          onSuccess: (session: CognitoUserSession) => {
            this.srpAuth.clearPendingUser()
            resolve(extractSessionTokens(session, email))
          },
          onFailure: (err) => reject(err),
        },
        'SOFTWARE_TOKEN_MFA',
      )
    })
  }

  verifyMfaSetup(totpCode: string): Promise<void> {
    const user = this.srpAuth.getPendingUser()
    return new Promise((resolve, reject) => {
      user.verifySoftwareToken(totpCode, 'authenticator', {
        onSuccess: () => {
          user.setUserMfaPreference(null, { PreferredMfa: true, Enabled: true }, (err) => {
            if (err) {
              reject(err)
              return
            }
            resolve()
          })
        },
        onFailure: (err) => reject(err),
      })
    })
  }
}
