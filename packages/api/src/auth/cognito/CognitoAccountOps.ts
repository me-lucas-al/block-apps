import {
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { CognitoConfig } from './CognitoConfig'
import { extractSessionTokens } from './extractSessionTokens'

export class CognitoAccountOps {
  private readonly userPool: CognitoUserPool

  constructor(config: CognitoConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId,
    })
  }

  getUser(email: string): CognitoUser {
    return new CognitoUser({ Username: email, Pool: this.userPool })
  }

  signUp(email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, [], [], (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  confirmSignUp(email: string, code: string): Promise<void> {
    const user = this.getUser(email)
    return new Promise((resolve, reject) => {
      user.confirmRegistration(code, true, (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  forgotPassword(email: string): Promise<void> {
    const user = this.getUser(email)
    return new Promise((resolve, reject) => {
      user.forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      })
    })
  }

  confirmPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = this.getUser(email)
    return new Promise((resolve, reject) => {
      user.confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      })
    })
  }

  refreshSession(email: string, refreshTokenString: string): Promise<SessionTokens> {
    const user = this.getUser(email)
    const refreshToken = new CognitoRefreshToken({ RefreshToken: refreshTokenString })
    return new Promise((resolve, reject) => {
      user.refreshSession(refreshToken, (err, session: CognitoUserSession) => {
        if (err) {
          reject(err)
          return
        }
        resolve(extractSessionTokens(session, email))
      })
    })
  }

  clearCachedSession(email: string): void {
    this.getUser(email).signOut()
  }
}
