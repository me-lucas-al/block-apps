export function readTokenClientId(claims: Record<string, unknown> | undefined): string | null {
  const audience = claims?.['aud']
  if (typeof audience === 'string' && audience.length > 0) return audience
  const clientId = claims?.['client_id']
  if (typeof clientId === 'string' && clientId.length > 0) return clientId
  return null
}
