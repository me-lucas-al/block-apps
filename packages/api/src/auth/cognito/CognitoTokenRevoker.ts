import type { CognitoConfig } from './CognitoConfig'
import { requireHostedDomain } from './requireHostedDomain'

const ALREADY_UNUSABLE_TOKEN_ERRORS: readonly string[] = ['invalid_token', 'unsupported_token_type']

async function readOAuthErrorCode(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json()
    if (typeof body !== 'object' || body === null || !('error' in body)) return null
    return typeof body.error === 'string' ? body.error : null
  } catch {
    return null
  }
}

export class CognitoTokenRevoker {
  constructor(private readonly config: CognitoConfig) {}

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const hostedDomain = requireHostedDomain(this.config)
    const response = await fetch(`https://${hostedDomain}/oauth2/revoke`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: refreshToken,
        client_id: this.config.clientId,
      }).toString(),
    })
    if (response.ok) return
    const errorCode = await readOAuthErrorCode(response)
    if (errorCode && ALREADY_UNUSABLE_TOKEN_ERRORS.includes(errorCode)) return
    throw new Error(`Refresh token revocation failed with status ${response.status}`)
  }
}
