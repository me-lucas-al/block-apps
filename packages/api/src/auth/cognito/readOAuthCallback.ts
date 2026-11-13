export function readOAuthCallback(callbackUrl: string, expectedState: string): string {
  const params = new URL(callbackUrl).searchParams
  if (params.get('state') !== expectedState) {
    throw new Error('OAuth state does not match the sign in request')
  }
  const providerError = params.get('error')
  if (providerError) {
    throw new Error(params.get('error_description') ?? providerError)
  }
  const code = params.get('code')
  if (!code) throw new Error('Authorization code missing in OAuth response')
  return code
}
