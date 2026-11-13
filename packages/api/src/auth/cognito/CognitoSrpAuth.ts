import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js'
import type { AuthResult } from '../contracts/AuthResult'
import type { SessionTokens } from '../contracts/SessionTokens'
import { challengeForSignInFailure } from './challengeForSignInFailure'
import type { CognitoConfig } from './CognitoConfig'
import { extractSessionTokens } from './extractSessionTokens'

export class CognitoSrpAuth {
  private readonly userPool: CognitoUserPool
  private activeUser: CognitoUser | null = null
  private activeEmail: string | null = null

  constructor(config: CognitoConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId,
    })
  }

  getPendingUser(): CognitoUser {
    if (!this.activeUser) throw new Error('No active authentication challenge')
    return this.activeUser
  }

  getActiveEmail(): string {
    return this.activeEmail ?? ''
  }

  clearPendingUser(): void {
    this.activeUser = null
    this.activeEmail = null
  }

  authenticate(
    email: string,
    password: string,
  ): Promise<{ result: AuthResult; tokens?: SessionTokens }> {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password })
    const user = new CognitoUser({ Username: email, Pool: this.userPool })
    this.activeUser = user
    this.activeEmail = email

    return new Promise((resolve, reject) => {
      user.authenticateUser(authDetails, {
        onSuccess: (session: CognitoUserSession) => {
          const tokens = extractSessionTokens(session, email)
          this.clearPendingUser()
          resolve({ result: { success: true }, tokens })
        },
        onFailure: (err) => {
          this.clearPendingUser()
          const challenge = challengeForSignInFailure(err)
          if (challenge) resolve({ result: { success: false, challenge } })
          else reject(err)
        },
        newPasswordRequired: () => {
          resolve({ result: { success: false, challenge: { kind: 'NEW_PASSWORD_REQUIRED' } } })
        },
        totpRequired: () => {
          resolve({ result: { success: false, challenge: { kind: 'MFA_REQUIRED' } } })
        },
        mfaSetup: () => {
          user.associateSoftwareToken({
            associateSecretCode: (secretCode: string) => {
              resolve({ result: { success: false, challenge: { kind: 'MFA_SETUP', secretCode } } })
            },
            onFailure: (err) => {
              this.clearPendingUser()
              reject(err)
            },
          })
        },
      })
    })
  }
}
