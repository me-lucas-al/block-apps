import type { CognitoConfig } from './CognitoConfig'

export function requireHostedDomain(config: CognitoConfig): string {
  if (!config.hostedDomain) throw new Error('hostedDomain is required for OAuth')
  return config.hostedDomain
}
