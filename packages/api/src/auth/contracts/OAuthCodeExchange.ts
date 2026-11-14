export type OAuthCodeExchange = {
  readonly code: string
  readonly verifier: string
  readonly redirectUri: string
}
