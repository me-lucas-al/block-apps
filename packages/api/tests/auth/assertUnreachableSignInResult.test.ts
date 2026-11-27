import { describe, expect, it } from 'vitest'
import { assertUnreachableSignInResult } from '../../src/auth/assertUnreachableSignInResult'

describe('assertUnreachableSignInResult', () => {
  it('names only the kind of the unhandled result', () => {
    const unhandledResult = { kind: 'future_kind', secretCode: 'TOP-SECRET' } as never

    expect(() => assertUnreachableSignInResult(unhandledResult)).toThrow(
      'Unhandled sign-in result kind: future_kind',
    )
    expect(() => assertUnreachableSignInResult(unhandledResult)).not.toThrow(/TOP-SECRET/)
  })
})
