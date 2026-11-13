import type { GoogleAuthorization } from '../contracts/GoogleAuthorization'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { PkceCrypto } from '../pkce/PkceCrypto'
import { generateCodeChallenge, generateRandomString } from '../pkce/pkce'
import type { CognitoConfig } from './CognitoConfig'
import { CognitoOAuthHelper } from './CognitoOAuthHelper'

export class CognitoOAuthFlow {
  private readonly helper: CognitoOAuthHelper

  constructor(
    config: CognitoConfig,
    private readonly pkceCrypto: PkceCrypto,
  ) {
    this.helper = new CognitoOAuthHelper(config)
  }

  async buildGoogleAuthorizeUrl(redirectUri: string): Promise<GoogleAuthorization> {
    const verifier = generateRandomString(this.pkceCrypto, 64)
    const state = generateRandomString(this.pkceCrypto, 32)
    const challenge = await generateCodeChallenge(this.pkceCrypto, verifier)
    const url = this.helper.buildAuthorizeUrl(redirectUri, challenge, state)
    return { url, verifier, state }
  }

  async exchangeCode(code: string, redirectUri: string, verifier: string): Promise<SessionTokens> {
    if (!verifier) throw new Error('PKCE code verifier is missing')
    return this.helper.exchangeAuthorizationCode(code, verifier, redirectUri)
  }
}
