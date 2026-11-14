export type ProviderLinkRequest = {
  readonly userPoolId: string
  readonly destinationUsername: string
  readonly providerName: string
  readonly providerUserId: string
}

export interface UserDirectoryLookup {
  findNativeUserByEmail(userPoolId: string, email: string): Promise<{ username: string } | null>
  linkProvider(request: ProviderLinkRequest): Promise<void>
}
