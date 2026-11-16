import { describe, expect, it } from 'vitest'
import { createStrictMode } from '../createStrictMode'

const sources = {
  platform: 'ios',
  isEnabledByBuild: true,
  ruleRepository: { list: async () => [], create: async () => ({}) },
  pendingRuleChanges: {},
  rulesSync: { sync: async () => undefined },
  isScreenTimeAuthorized: () => true,
  deviceAcceptance: { hasAcceptedOnThisDevice: () => true, acceptOnThisDevice: () => undefined },
}

function build(overrides: Record<string, unknown> = {}) {
  return createStrictMode({ ...sources, ...overrides } as unknown as Parameters<typeof createStrictMode>[0])
}

describe('createStrictMode', () => {
  it('builds the controller on ios when the build enables it', () => {
    expect(build()).not.toBeNull()
  })

  it('stays hidden when the build flag is off', () => {
    expect(build({ isEnabledByBuild: false })).toBeNull()
  })

  it('stays hidden outside ios', () => {
    expect(build({ platform: 'android' })).toBeNull()
  })

  it('stays hidden when the platform cannot record the device acceptance', () => {
    expect(build({ deviceAcceptance: null })).toBeNull()
  })
})
