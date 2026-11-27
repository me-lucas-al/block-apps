import type { Authenticator } from '../Authenticator'
import type { GoogleAuthorization } from '../contracts/GoogleAuthorization'
import type { OAuthCodeExchange } from '../contracts/OAuthCodeExchange'
import type { SessionStorage } from '../contracts/SessionStorage'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { SignInResult } from '../contracts/SignInResult'
import type { PkceCrypto } from '../pkce/PkceCrypto'
import type { LocalUserSession } from '../session/LocalUserSession'
import {
  assembleCognitoAuthCollaborators,
  type CognitoAuthCollaborators,
} from './assembleCognitoAuthCollaborators'
import type { CognitoConfig } from './CognitoConfig'

export class CognitoAuthenticator implements Authenticator {
  private readonly parts: CognitoAuthCollaborators

  constructor(
    config: CognitoConfig,
    storage: SessionStorage,
    session: LocalUserSession,
    pkceCrypto?: PkceCrypto,
  ) {
    this.parts = assembleCognitoAuthCollaborators(config, storage, session, pkceCrypto)
  }

  async signInWithPassword(email: string, password: string): Promise<SignInResult> {
    const { signInResult, tokens } = await this.parts.srpAuth.authenticate(email, password)
    if (tokens) await this.parts.sessionManager.persistTokens(tokens)
    return signInResult
  }

  async respondToNewPassword(newPassword: string): Promise<void> {
    await this.parts.sessionManager.persistTokens(
      await this.parts.challengeResolver.completeNewPassword(newPassword),
    )
  }

  async respondToMfaCode(totpCode: string): Promise<void> {
    await this.parts.sessionManager.persistTokens(
      await this.parts.challengeResolver.sendTotpCode(totpCode),
    )
  }

  async respondToMfaSetup(totpCode: string): Promise<void> {
    await this.parts.challengeResolver.verifyMfaSetup(totpCode)
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

  async signUpWithPassword(email: string, password: string): Promise<void> {
    await this.parts.accountOps.signUp(email, password)
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    await this.parts.accountOps.confirmSignUp(email, code)
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.parts.accountOps.forgotPassword(email)
  }

  async confirmPasswordReset(email: string, code: string, nextPass: string): Promise<void> {
    await this.parts.accountOps.confirmPassword(email, code, nextPass)
  }

  beginGoogleSignIn(redirectUri: string): Promise<GoogleAuthorization> {
    return this.parts.oauthFlow.buildGoogleAuthorizeUrl(redirectUri)
  }

  async exchangeOAuthCode(codeExchange: OAuthCodeExchange): Promise<void> {
    await this.parts.sessionManager.persistTokens(
      await this.parts.oauthFlow.exchangeCode(codeExchange),
    )
  }

  async signOut(): Promise<void> {
    await this.parts.sessionManager.signOut()
  }

  async refreshSession(): Promise<SessionTokens | null> {
    return this.parts.sessionManager.refreshSession()
  }

  private async freshTokens(): Promise<SessionTokens> {
    const tokens = await this.parts.sessionManager.refreshSession()
    if (!tokens) throw new Error('Sessão expirada. Entre novamente.')
    return tokens
  }
}
