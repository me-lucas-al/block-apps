import type { Authenticator } from '../Authenticator'
import type { AuthResult } from '../contracts/AuthResult'
import type { GoogleAuthorization } from '../contracts/GoogleAuthorization'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { CognitoAccountOps } from './CognitoAccountOps'
import type { CognitoChallengeResolver } from './CognitoChallengeResolver'
import type { CognitoOAuthFlow } from './CognitoOAuthFlow'
import type { CognitoPasswordChange } from './CognitoPasswordChange'
import type { CognitoSessionManager } from './CognitoSessionManager'
import type { CognitoSrpAuth } from './CognitoSrpAuth'
import type { CognitoTotpEnrollment } from './CognitoTotpEnrollment'

export type CognitoAuthenticatorParts = {
  readonly srpAuth: CognitoSrpAuth
  readonly challengeResolver: CognitoChallengeResolver
  readonly accountOps: CognitoAccountOps
  readonly oauthFlow: CognitoOAuthFlow
  readonly sessionManager: CognitoSessionManager
  readonly totpEnrollment: CognitoTotpEnrollment
  readonly passwordChange: CognitoPasswordChange
}

export class CognitoAuthenticator implements Authenticator {
  constructor(private readonly parts: CognitoAuthenticatorParts) {}

  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    const { result, tokens } = await this.parts.srpAuth.authenticate(email, password)
    if (tokens) await this.parts.sessionManager.persistTokens(tokens)
    return result
  }

  async respondToNewPassword(newPassword: string): Promise<void> {
    const tokens = await this.parts.challengeResolver.completeNewPassword(newPassword)
    await this.parts.sessionManager.persistTokens(tokens)
  }

  async respondToMfaCode(totpCode: string): Promise<void> {
    const tokens = await this.parts.challengeResolver.sendTotpCode(totpCode)
    await this.parts.sessionManager.persistTokens(tokens)
  }

  respondToMfaSetup(totpCode: string): Promise<void> {
    return this.parts.challengeResolver.verifyMfaSetup(totpCode)
  }

  async beginTotpEnrollment(): Promise<string> {
    return this.parts.totpEnrollment.begin(await this.freshTokens())
  }

  async confirmTotpEnrollment(totpCode: string): Promise<void> {
    await this.parts.totpEnrollment.confirm(await this.freshTokens(), totpCode)
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.parts.passwordChange.change(await this.freshTokens(), currentPassword, newPassword)
  }

  signUpWithPassword(email: string, password: string): Promise<void> {
    return this.parts.accountOps.signUp(email, password)
  }

  confirmSignUp(email: string, code: string): Promise<void> {
    return this.parts.accountOps.confirmSignUp(email, code)
  }

  resendConfirmationCode(email: string): Promise<void> {
    return this.parts.accountOps.resendConfirmationCode(email)
  }

  requestPasswordReset(email: string): Promise<void> {
    return this.parts.accountOps.forgotPassword(email)
  }

  confirmPasswordReset(email: string, code: string, nextPass: string): Promise<void> {
    return this.parts.accountOps.confirmPassword(email, code, nextPass)
  }

  beginGoogleSignIn(redirectUri: string): Promise<GoogleAuthorization> {
    return this.parts.oauthFlow.buildGoogleAuthorizeUrl(redirectUri)
  }

  async exchangeOAuthCode(code: string, verifier: string, redirectUri: string): Promise<void> {
    const tokens = await this.parts.oauthFlow.exchangeCode(code, redirectUri, verifier)
    await this.parts.sessionManager.persistTokens(tokens)
  }

  signOut(): Promise<void> {
    return this.parts.sessionManager.signOut()
  }

  refreshSession(): Promise<SessionTokens | null> {
    return this.parts.sessionManager.refreshSession()
  }

  private async freshTokens(): Promise<SessionTokens> {
    const tokens = await this.parts.sessionManager.refreshSession()
    if (!tokens) throw new Error('Sessão expirada. Entre novamente.')
    return tokens
  }
}
