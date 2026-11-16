import type { StrictModeAcceptancePort } from '../ports/strictmode/StrictModeAcceptancePort'

export function releaseStrictModeWhenBuildDisablesIt(
  isEnabledByBuild: boolean,
  deviceAcceptance: StrictModeAcceptancePort | null,
): void {
  if (isEnabledByBuild) return
  if (!deviceAcceptance?.hasAcceptedOnThisDevice()) return
  deviceAcceptance.revokeOnThisDevice()
}
