import type { SessionTokens } from '../contracts/SessionTokens'
import type { CognitoConfig } from './CognitoConfig'
import { CognitoOAuthHelper } from './CognitoOAuthHelper'
import { generateCodeChallenge, generateRandomString } from './pkce'

const PKCE_VERIFIER_KEY = 'block_apps_pkce_verifier'

export class CognitoOAuthFlow {
  private readonly helper: CognitoOAuthHelper

  constructor(private readonly config: CognitoConfig) {
    this.helper = new CognitoOAuthHelper(config)
  }

  async buildGoogleAuthorizeUrl(redirectUri: string): Promise<string> {
    const verifier = generateRandomString(64)
    const challenge = await generateCodeChallenge(verifier)
    this.saveVerifier(verifier)
    return this.helper.buildAuthorizeUrl(redirectUri, challenge)
  }

  async exchangeCode(
    code: string,
    redirectUri: string,
    explicitVerifier?: string,
  ): Promise<SessionTokens> {
    const verifier = explicitVerifier || this.readSavedVerifier()
    if (!verifier) {
      throw new Error('PKCE code verifier is missing')
    }
    const tokens = await this.helper.exchangeAuthorizationCode(code, verifier, redirectUri)
    this.clearSavedVerifier()
    return tokens
  }

  private getStorage(): Storage | null {
    if (typeof sessionStorage !== 'undefined') return sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage
    return null
  }

  private saveVerifier(verifier: string): void {
    this.getStorage()?.setItem(PKCE_VERIFIER_KEY, verifier)
  }

  private readSavedVerifier(): string | null {
    return this.getStorage()?.getItem(PKCE_VERIFIER_KEY) ?? null
  }

  private clearSavedVerifier(): void {
    this.getStorage()?.removeItem(PKCE_VERIFIER_KEY)
  }
}
