export type ProtectionCheck = {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly active: boolean
  readonly actionLabel: string
  readonly performAction: () => void | Promise<void>
}

export interface ProtectionPort {
  listChecks(): readonly ProtectionCheck[]
  isDeviceProtected(): boolean
  requestAuthorizationOnFirstOpen(): Promise<void>
}
