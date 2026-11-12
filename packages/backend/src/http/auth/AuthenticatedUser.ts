export type AuthenticatedUser = {
  readonly userId: string
  readonly groups: readonly string[]
}
