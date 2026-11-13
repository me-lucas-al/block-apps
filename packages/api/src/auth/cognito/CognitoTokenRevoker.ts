import type { CognitoConfig } from './CognitoConfig'
import { requireHostedDomain } from './requireHostedDomain'

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
    if (!response.ok) {
      throw new Error(`Refresh token revocation failed with status ${response.status}`)
    }
  }
}
