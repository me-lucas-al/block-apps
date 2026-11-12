export type UserDirectoryLookup = {
  findNativeUserByEmail(userPoolId: string, email: string): Promise<{ username: string } | null>
  linkProvider(input: {
    userPoolId: string
    destinationUsername: string
    providerName: string
    providerUserId: string
  }): Promise<void>
}

export type FederatedUserEvent = {
  readonly triggerSource: string
  readonly userPoolId: string
  readonly userName: string
  readonly email?: string | null
  readonly emailVerified?: boolean
}

export type LinkOutcome = {
  readonly linked: boolean
  readonly autoConfirm: boolean
}

export class LinkFederatedUserUseCase {
  constructor(private readonly directory: UserDirectoryLookup) {}

  async link(event: FederatedUserEvent): Promise<LinkOutcome> {
    if (event.triggerSource !== 'PreSignUp_ExternalProvider') {
      return { linked: false, autoConfirm: false }
    }
    if (!event.email || !event.emailVerified) {
      return { linked: false, autoConfirm: false }
    }
    const splitIndex = event.userName.indexOf('_')
    if (splitIndex === -1) {
      return { linked: false, autoConfirm: true }
    }
    const providerName = event.userName.slice(0, splitIndex)
    const providerUserId = event.userName.slice(splitIndex + 1)
    if (!providerName || !providerUserId) {
      return { linked: false, autoConfirm: true }
    }

    const existingUser = await this.directory.findNativeUserByEmail(event.userPoolId, event.email)
    if (!existingUser) {
      return { linked: false, autoConfirm: true }
    }

    await this.directory.linkProvider({
      userPoolId: event.userPoolId,
      destinationUsername: existingUser.username,
      providerName,
      providerUserId,
    })
    return { linked: true, autoConfirm: false }
  }
}
