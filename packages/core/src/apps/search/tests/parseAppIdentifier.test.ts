import { describe, expect, it } from 'vitest'
import { parseAppIdentifier } from '../parseAppIdentifier'

describe('parseAppIdentifier', () => {
  it.each([
    ['com.instagram.android', 'com.instagram.android'],
    ['  com.miHoYo.GenshinImpact ', 'com.miHoYo.GenshinImpact'],
    ['br.com.bb.android', 'br.com.bb.android'],
    ['https://play.google.com/store/apps/details?id=com.whatsapp', 'com.whatsapp'],
    ['play.google.com/store/apps/details?id=org.telegram.messenger&hl=pt_BR', 'org.telegram.messenger'],
  ])('reads %s as %s', (input, expected) => {
    expect(parseAppIdentifier(input)).toBe(expected)
  })

  it.each([
    '',
    '   ',
    'instagram',
    'not a package',
    'com.1abc',
    'v1.2',
    'https://example.com/store/apps/details?id=com.whatsapp',
    'https://play.google.com/store/apps/details',
    'https://play.google.com/store/apps/details?id=nopackage',
    'https://play.google.com/store/movies/details?id=com.whatsapp',
  ])('rejects %j', (input) => {
    expect(parseAppIdentifier(input)).toBeNull()
  })

  it.each(['instagram.com', 'www.instagram.com', 'google.com.br', 'wa.me', 't.me', 'site.org'])(
    'does not mistake the web domain %s for a package',
    (domain) => {
      expect(parseAppIdentifier(domain)).toBeNull()
    },
  )
})
