export interface StrictModeAcceptancePort {
  hasAcceptedOnThisDevice(): boolean
  acceptOnThisDevice(): void
}
