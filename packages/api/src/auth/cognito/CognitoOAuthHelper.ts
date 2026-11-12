import type { CognitoConfig } from './CognitoConfig'
import type { SessionTokens } from '../contracts/SessionTokens'

export class CognitoOAuthHelper {
  constructor(private readonly config: CognitoConfig) {}

  buildAuthorizeUrl(redirectUri: string, codeChallenge: string): string {
    if (!this.config.hostedDomain) {
      throw new Error('hostedDomain is required for OAuth')
    }
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      scope: 'email openid profile',
      redirect_uri: redirectUri,
      identity_provider: 'Google',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })
    return `https://${this.config.hostedDomain}/oauth2/authorize?${params.toString()}`
  }

  async exchangeAuthorizationCode(
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ): Promise<SessionTokens> {
    if (!this.config.hostedDomain) {
      throw new Error('hostedDomain is required for OAuth')
    }
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    })
    const response = await fetch(`https://${this.config.hostedDomain}/oauth2/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!response.ok) {
      throw new Error(`OAuth token exchange failed with status ${response.status}`)
    }
    const data = (await response.json()) as {
      access_token: string
      id_token: string
      refresh_token: string
    }
    const email = this.extractEmailFromIdToken(data.id_token)
    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      email,
    }
  }

  private extractEmailFromIdToken(idToken: string): string {
    const email = this.readEmailClaim(idToken)
    if (!email) throw new Error('OAuth id token has no email')
    return email
  }

  private readEmailClaim(idToken: string): string | null {
    const payloadBase64 = idToken.split('.')[1]
    if (!payloadBase64) return null
    try {
      const decoded = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
      const parsed = JSON.parse(decoded) as { email?: string }
      return parsed.email ?? null
    } catch {
      return null
    }
  }
}
