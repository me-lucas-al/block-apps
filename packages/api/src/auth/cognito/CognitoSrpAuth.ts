import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { SignInResult } from '../contracts/SignInResult'
import type { CognitoConfig } from './CognitoConfig'
import { extractSessionTokens } from './extractSessionTokens'
import { readSignInFailureResult } from './readSignInFailureResult'

export type SrpAuthOutcome = {
  readonly signInResult: SignInResult
  readonly tokens?: SessionTokens
}

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

  authenticate(email: string, password: string): Promise<SrpAuthOutcome> {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password })
    const user = new CognitoUser({ Username: email, Pool: this.userPool })
    this.activeUser = user
    this.activeEmail = email

    return new Promise((resolve, reject) => {
      user.authenticateUser(authDetails, {
        onSuccess: (session: CognitoUserSession) => {
          const tokens = extractSessionTokens(session, email)
          this.clearPendingUser()
          resolve({ signInResult: { kind: 'signed_in' }, tokens })
        },
        onFailure: (failure) => {
          this.clearPendingUser()
          const signInResult = readSignInFailureResult(failure)
          if (signInResult) resolve({ signInResult })
          else reject(failure)
        },
        newPasswordRequired: () => {
          resolve({ signInResult: { kind: 'new_password_required' } })
        },
        totpRequired: () => {
          resolve({ signInResult: { kind: 'mfa_totp_required' } })
        },
        mfaSetup: () => {
          user.associateSoftwareToken({
            associateSecretCode: (secretCode: string) => {
              resolve({ signInResult: { kind: 'mfa_setup_required', secretCode } })
            },
            onFailure: (failure) => {
              this.clearPendingUser()
              reject(failure)
            },
          })
        },
      })
    })
  }
}
