const STATE_MISMATCH_MESSAGE = 'OAuth state does not match the sign in request'
const UNVERIFIED_PROVIDER_FAILURE_MESSAGE = 'O login com o provedor falhou. Tente novamente.'

export function readOAuthCallback(callbackUrl: string, expectedState: string): string {
  const params = new URL(callbackUrl).searchParams
  const returnedState = params.get('state')
  const providerError = params.get('error')
  if (returnedState === null && providerError) {
    throw new Error(UNVERIFIED_PROVIDER_FAILURE_MESSAGE)
  }
  if (returnedState !== expectedState) throw new Error(STATE_MISMATCH_MESSAGE)
  if (providerError) throw new Error(params.get('error_description') ?? providerError)
  const code = params.get('code')
  if (!code) throw new Error('Authorization code missing in OAuth response')
  return code
}
