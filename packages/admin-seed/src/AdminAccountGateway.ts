export type NewAdminAccount = {
  readonly email: string
  readonly password: string
  readonly displayName: string
}

export interface AdminAccountGateway {
  createAuthUser(account: NewAdminAccount): Promise<string>
  promoteProfileToAdmin(userId: string, displayName: string): Promise<void>
  deleteAuthUser(userId: string): Promise<void>
}
