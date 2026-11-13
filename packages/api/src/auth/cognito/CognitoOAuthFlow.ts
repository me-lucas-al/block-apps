import type { GoogleAuthorization } from '../contracts/GoogleAuthorization'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { CognitoConfig } from './CognitoConfig'
import { CognitoOAuthHelper } from './CognitoOAuthHelper'
import { generateCodeChallenge, generateRandomString } from './pkce'

export class CognitoOAuthFlow {
  private readonly helper: CognitoOAuthHelper

  constructor(config: CognitoConfig) {
    this.helper = new CognitoOAuthHelper(config)
  }

  async buildGoogleAuthorizeUrl(redirectUri: string): Promise<GoogleAuthorization> {
    const verifier = generateRandomString(64)
    const state = generateRandomString(32)
    const challenge = await generateCodeChallenge(verifier)
    const url = this.helper.buildAuthorizeUrl(redirectUri, challenge, state)
    return { url, verifier, state }
  }

  async exchangeCode(code: string, redirectUri: string, verifier: string): Promise<SessionTokens> {
    if (!verifier) throw new Error('PKCE code verifier is missing')
    return this.helper.exchangeAuthorizationCode(code, verifier, redirectUri)
  }
}
