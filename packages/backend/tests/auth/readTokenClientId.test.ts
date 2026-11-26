import { describe, expect, it } from 'vitest'
import { readTokenClientId } from '../../src/http/auth/readTokenClientId'

describe('readTokenClientId', () => {
  it.each([
    ['aud on an id token', { aud: 'admin-client' }, 'admin-client'],
    ['client_id on an access token', { client_id: 'admin-client' }, 'admin-client'],
    ['aud over client_id when both are present', { aud: 'from-aud', client_id: 'from-client' }, 'from-aud'],
    ['client_id when aud is an empty string', { aud: '', client_id: 'from-client' }, 'from-client'],
    ['nothing when aud is an empty string and client_id is missing', { aud: '' }, null],
    ['nothing when both are empty strings', { aud: '', client_id: '' }, null],
    ['nothing when claims are empty', {}, null],
    ['nothing when claims are undefined', undefined, null],
    ['client_id when aud is not a string', { aud: ['admin-client'], client_id: 'from-client' }, 'from-client'],
    ['nothing when client_id is not a string', { client_id: 7 }, null],
  ])('reads %s', (_label, claims, expectedClientId) => {
    expect(readTokenClientId(claims)).toBe(expectedClientId)
  })
})
