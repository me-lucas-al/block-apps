import { describe, expect, it } from 'vitest'
import { parseAppIdentifier } from '../parseAppIdentifier'

describe('parseAppIdentifier', () => {
  it.each([
    ['com.instagram.android', 'com.instagram.android'],
    ['  com.miHoYo.GenshinImpact ', 'com.miHoYo.GenshinImpact'],
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
    'https://example.com/store/apps/details?id=com.whatsapp',
    'https://play.google.com/store/apps/details',
    'https://play.google.com/store/apps/details?id=nopackage',
    'https://play.google.com/store/movies/details?id=com.whatsapp',
  ])('rejects %j', (input) => {
    expect(parseAppIdentifier(input)).toBeNull()
  })
})
