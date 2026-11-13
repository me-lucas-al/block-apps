import type { Authenticator } from '../Authenticator'
import type { AuthResult } from '../contracts/AuthResult'
import type { GoogleAuthorization } from '../contracts/GoogleAuthorization'
import type { SessionStorage } from '../contracts/SessionStorage'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { PkceCrypto } from '../pkce/PkceCrypto'
import type { LocalUserSession } from '../session/LocalUserSession'
import { CognitoAccountOps } from './CognitoAccountOps'
import { CognitoChallengeResolver } from './CognitoChallengeResolver'
import type { CognitoConfig } from './CognitoConfig'
import { CognitoOAuthFlow } from './CognitoOAuthFlow'
import { CognitoPasswordChange } from './CognitoPasswordChange'
import { CognitoSessionManager } from './CognitoSessionManager'
import { CognitoSrpAuth } from './CognitoSrpAuth'
import { CognitoTokenRevoker } from './CognitoTokenRevoker'
import { CognitoTotpEnrollment } from './CognitoTotpEnrollment'

export class CognitoAuthenticator implements Authenticator {
  private readonly srpAuth: CognitoSrpAuth
  private readonly challengeResolver: CognitoChallengeResolver
  private readonly accountOps: CognitoAccountOps
  private readonly oauthFlow: CognitoOAuthFlow
  private readonly sessionManager: CognitoSessionManager
  private readonly totpEnrollment: CognitoTotpEnrollment
  private readonly passwordChange: CognitoPasswordChange

  constructor(
    config: CognitoConfig,
    storage: SessionStorage,
    session: LocalUserSession,
    pkceCrypto?: PkceCrypto,
  ) {
    this.srpAuth = new CognitoSrpAuth(config)
    this.challengeResolver = new CognitoChallengeResolver(this.srpAuth)
    this.accountOps = new CognitoAccountOps(config)
    this.oauthFlow = new CognitoOAuthFlow(config, pkceCrypto)
    this.sessionManager = new CognitoSessionManager(
      storage,
      session,
      this.accountOps,
      new CognitoTokenRevoker(config),
    )
    this.totpEnrollment = new CognitoTotpEnrollment(config)
    this.passwordChange = new CognitoPasswordChange(config)
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    const { result, tokens } = await this.srpAuth.authenticate(email, password)
    if (tokens) await this.sessionManager.persistTokens(tokens)
    return result
  }

  async respondToNewPassword(newPassword: string): Promise<void> {
    await this.sessionManager.persistTokens(
      await this.challengeResolver.completeNewPassword(newPassword),
    )
  }

  async respondToMfaCode(totpCode: string): Promise<void> {
    await this.sessionManager.persistTokens(await this.challengeResolver.sendTotpCode(totpCode))
  }

  async respondToMfaSetup(totpCode: string): Promise<void> {
    await this.challengeResolver.verifyMfaSetup(totpCode)
  }

  async beginTotpEnrollment(): Promise<string> {
    return this.totpEnrollment.begin(await this.freshTokens())
  }

  async confirmTotpEnrollment(totpCode: string): Promise<void> {
    await this.totpEnrollment.confirm(await this.freshTokens(), totpCode)
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.passwordChange.change(await this.freshTokens(), currentPassword, newPassword)
  }

  async signUpWithPassword(email: string, password: string): Promise<void> {
    await this.accountOps.signUp(email, password)
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    await this.accountOps.confirmSignUp(email, code)
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.accountOps.forgotPassword(email)
  }

  async confirmPasswordReset(email: string, code: string, nextPass: string): Promise<void> {
    await this.accountOps.confirmPassword(email, code, nextPass)
  }

  beginGoogleSignIn(redirectUri: string): Promise<GoogleAuthorization> {
    return this.oauthFlow.buildGoogleAuthorizeUrl(redirectUri)
  }

  async exchangeOAuthCode(code: string, verifier: string, redirectUri: string): Promise<void> {
    await this.sessionManager.persistTokens(
      await this.oauthFlow.exchangeCode(code, redirectUri, verifier),
    )
  }

  async signOut(): Promise<void> {
    await this.sessionManager.signOut()
  }

  async refreshSession(): Promise<SessionTokens | null> {
    return this.sessionManager.refreshSession()
  }

  private async freshTokens(): Promise<SessionTokens> {
    const tokens = await this.sessionManager.refreshSession()
    if (!tokens) throw new Error('Sessão expirada. Entre novamente.')
    return tokens
  }
}
