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
  private readonly cognitoCollaborators: CognitoAuthCollaborators

  constructor(
    config: CognitoConfig,
    storage: SessionStorage,
    session: LocalUserSession,
    pkceCrypto?: PkceCrypto,
  ) {
    this.cognitoCollaborators = assembleCognitoAuthCollaborators(config, storage, session, pkceCrypto)
  }

  async signInWithPassword(email: string, password: string): Promise<SignInResult> {
    const { signInResult, tokens } = await this.cognitoCollaborators.srpAuth.authenticate(email, password)
    if (tokens) await this.cognitoCollaborators.sessionManager.persistTokens(tokens)
    return signInResult
  }

  async respondToNewPassword(newPassword: string): Promise<void> {
    await this.cognitoCollaborators.sessionManager.persistTokens(
      await this.cognitoCollaborators.challengeResolver.completeNewPassword(newPassword),
    )
  }

  async respondToMfaCode(totpCode: string): Promise<void> {
    await this.cognitoCollaborators.sessionManager.persistTokens(
      await this.cognitoCollaborators.challengeResolver.sendTotpCode(totpCode),
    )
  }

  async respondToMfaSetup(totpCode: string): Promise<void> {
    await this.cognitoCollaborators.challengeResolver.verifyMfaSetup(totpCode)
  }

  async beginTotpEnrollment(): Promise<string> {
    return this.cognitoCollaborators.totpEnrollment.begin(await this.freshTokens())
  }

  async confirmTotpEnrollment(totpCode: string): Promise<void> {
    await this.cognitoCollaborators.totpEnrollment.confirm(await this.freshTokens(), totpCode)
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.cognitoCollaborators.passwordChange.change(await this.freshTokens(), currentPassword, newPassword)
  }

  async signUpWithPassword(email: string, password: string): Promise<void> {
    await this.cognitoCollaborators.accountOps.signUp(email, password)
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    await this.cognitoCollaborators.accountOps.confirmSignUp(email, code)
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.cognitoCollaborators.accountOps.forgotPassword(email)
  }

  async confirmPasswordReset(email: string, code: string, nextPass: string): Promise<void> {
    await this.cognitoCollaborators.accountOps.confirmPassword(email, code, nextPass)
  }

  beginGoogleSignIn(redirectUri: string): Promise<GoogleAuthorization> {
    return this.cognitoCollaborators.oauthFlow.buildGoogleAuthorizeUrl(redirectUri)
  }

  async exchangeOAuthCode(codeExchange: OAuthCodeExchange): Promise<void> {
    await this.cognitoCollaborators.sessionManager.persistTokens(
      await this.cognitoCollaborators.oauthFlow.exchangeCode(codeExchange),
    )
  }

  async signOut(): Promise<void> {
    await this.cognitoCollaborators.sessionManager.signOut()
  }

  async refreshSession(): Promise<SessionTokens | null> {
    return this.cognitoCollaborators.sessionManager.refreshSession()
  }

  private async freshTokens(): Promise<SessionTokens> {
    const tokens = await this.cognitoCollaborators.sessionManager.refreshSession()
    if (!tokens) throw new Error('Sessão expirada. Entre novamente.')
    return tokens
  }
}
