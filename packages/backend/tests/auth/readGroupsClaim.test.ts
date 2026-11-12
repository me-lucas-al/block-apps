import { describe, expect, it } from 'vitest'
import { readGroupsClaim } from '../../src/http/auth/readGroupsClaim'

describe('readGroupsClaim', () => {
  it.each([
    ['bracketed string from the API Gateway authorizer', '[admin user]', ['admin', 'user']],
    ['comma separated string', 'admin,user', ['admin', 'user']],
    ['array claim', ['admin'], ['admin']],
    ['empty brackets', '[]', []],
    ['missing claim', undefined, []],
    ['number', 3, []],
  ])('reads %s', (_label, claim, expected) => {
    expect(readGroupsClaim(claim)).toEqual(expected)
  })
})
