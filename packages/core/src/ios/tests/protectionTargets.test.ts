import { describe, expect, it } from 'vitest'
import { IOS_DENY_APP_REMOVAL_TARGET, isProtectionTarget } from '../protectionTargets'

describe('isProtectionTarget', () => {
  it('accepts the deny app removal target', () => {
    expect(isProtectionTarget(IOS_DENY_APP_REMOVAL_TARGET)).toBe(true)
  })

  it.each(['', 'ios-other', 'IOS-DENY-APP-REMOVAL'])('rejects %j', (target) => {
    expect(isProtectionTarget(target)).toBe(false)
  })
})
