import type { StrictModeAcceptancePort } from '../ports/strictmode/StrictModeAcceptancePort'

export function releaseStrictModeWhenBuildDisablesIt(
  isEnabledByBuild: boolean,
  deviceAcceptance: StrictModeAcceptancePort | null,
): void {
  if (isEnabledByBuild) return
  if (!deviceAcceptance?.hasAcceptedOnThisDevice()) return
  try {
    deviceAcceptance.revokeOnThisDevice()
  } catch (failure: unknown) {
    console.warn('Strict mode could not be released at startup', failure)
  }
}
