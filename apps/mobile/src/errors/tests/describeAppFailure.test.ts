import { describe, expect, it } from 'vitest'
import { describeAppFailure } from '../describeAppFailure'

describe('describeAppFailure', () => {
  it('describes a native failure by its code', () => {
    const nativeFailure = Object.assign(new Error('raw native text'), {
      code: 'ERR_ANOTHER_ACCOUNT_OWNS_RULES',
    })
    expect(describeAppFailure(nativeFailure)).toContain('protegido por outra conta')
  })

  it('describes every known native code', () => {
    for (const code of [
      'ERR_INVALID_RULES',
      'ERR_SCHEDULE_REGISTRATION_FAILED',
      'ERR_APP_GROUP_UNAVAILABLE',
      'ERR_SELECTION_NOT_SAVED',
      'ERR_PICKER_NOT_PRESENTED',
    ]) {
      expect(describeAppFailure({ code })).not.toBe('')
    }
  })

  it('falls back to the API description for other failures', () => {
    expect(describeAppFailure(new Error('network down'))).toBe('network down')
    expect(describeAppFailure({ code: 'ERR_UNKNOWN' })).not.toContain('protegido')
  })
})
