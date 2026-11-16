import { describe, expect, it, vi } from 'vitest'
import { releaseStrictModeWhenBuildDisablesIt } from '../releaseStrictModeWhenBuildDisablesIt'

function buildAcceptance(accepted: boolean) {
  return {
    hasAcceptedOnThisDevice: () => accepted,
    acceptOnThisDevice: vi.fn(),
    revokeOnThisDevice: vi.fn(),
  }
}

describe('releaseStrictModeWhenBuildDisablesIt', () => {
  it('revokes an accepted strict mode when the build has the flag off', () => {
    const acceptance = buildAcceptance(true)
    releaseStrictModeWhenBuildDisablesIt(false, acceptance)
    expect(acceptance.revokeOnThisDevice).toHaveBeenCalledOnce()
  })

  it('keeps it when the build has the flag on', () => {
    const acceptance = buildAcceptance(true)
    releaseStrictModeWhenBuildDisablesIt(true, acceptance)
    expect(acceptance.revokeOnThisDevice).not.toHaveBeenCalled()
  })

  it('does nothing when nothing was accepted or the platform has no acceptance', () => {
    const acceptance = buildAcceptance(false)
    releaseStrictModeWhenBuildDisablesIt(false, acceptance)
    releaseStrictModeWhenBuildDisablesIt(false, null)
    expect(acceptance.revokeOnThisDevice).not.toHaveBeenCalled()
  })
})
