import { describe, expect, it } from 'vitest'
import type { AppSuggestion, KnownApp } from '../../catalog/types'
import { searchApps } from '../searchApps'

const suggestions: AppSuggestion[] = [
  { packageName: 'com.instagram.android', label: 'Instagram', category: 'social' },
  { packageName: 'com.instagram.barcelona', label: 'Threads', category: 'social' },
  { packageName: 'com.whatsapp', label: 'WhatsApp', category: 'messaging' },
  { packageName: 'com.spotify.music', label: 'Spotify', category: 'music' },
  { packageName: 'com.twitter.android', label: 'X', category: 'social', aliases: ['twitter'] },
  { packageName: 'com.miHoYo.GenshinImpact', label: 'Genshin Impact', category: 'games' },
]

const installed: KnownApp[] = [
  { packageName: 'com.whatsapp', label: 'WhatsApp' },
  { packageName: 'com.example.calculator', label: 'Calculadora' },
  { packageName: 'com.example.agenda', label: 'Agenda' },
]

const search = (query: string) => searchApps({ installed, suggestions, query })
const packagesOf = (query: string) => search(query).map((option) => option.packageName)

describe('searchApps', () => {
  it('lists suggestions first, then the remaining installed apps alphabetically', () => {
    expect(packagesOf('')).toEqual([
      'com.instagram.android',
      'com.instagram.barcelona',
      'com.whatsapp',
      'com.spotify.music',
      'com.twitter.android',
      'com.miHoYo.GenshinImpact',
      'com.example.agenda',
      'com.example.calculator',
    ])
  })

  it('marks which options are installed and which are suggested', () => {
    const options = search('')
    expect(options[0]).toMatchObject({ installed: false, suggested: true })
    expect(options[2]).toMatchObject({ installed: true, suggested: true })
    expect(options[6]).toMatchObject({ installed: true, suggested: false })
  })

  it('finds apps that are not installed', () => {
    expect(search('spot').map((option) => option.label)).toEqual(['Spotify'])
  })

  it('ignores case and accents', () => {
    expect(search('CALCULADORA')).toHaveLength(1)
    expect(search('calculadorá')).toHaveLength(1)
  })

  it('matches on the package name', () => {
    expect(search('example').map((option) => option.label)).toEqual(['Agenda', 'Calculadora'])
  })

  it('matches aliases such as the old name of an app', () => {
    expect(search('twitter').map((option) => option.label)).toEqual(['X'])
  })

  it('returns nothing for text that matches no app', () => {
    expect(search('zzzz')).toEqual([])
  })

  it('treats a lone diacritic character as no filter text instead of listing everything', () => {
    expect(search('^')).toEqual([])
  })

  describe('packages typed or pasted by the user', () => {
    it('offers an unknown package as an unverified option after the matches', () => {
      expect(search('com.roblox.client')).toEqual([
        {
          packageName: 'com.roblox.client',
          label: 'com.roblox.client',
          installed: false,
          suggested: false,
        },
      ])
    })

    it('keeps the unverified option last while the user is still typing', () => {
      expect(packagesOf('com.insta')).toEqual([
        'com.instagram.android',
        'com.instagram.barcelona',
        'com.insta',
      ])
    })

    it('offers the package found in a Play Store link', () => {
      const [option] = search('https://play.google.com/store/apps/details?id=com.roblox.client')
      expect(option?.packageName).toBe('com.roblox.client')
    })

    it('returns the listed app when the link points to an app that is already listed', () => {
      const [option, ...rest] = search('https://play.google.com/store/apps/details?id=com.spotify.music')
      expect(option).toMatchObject({ packageName: 'com.spotify.music', label: 'Spotify', suggested: true })
      expect(rest).toEqual([])
    })

    it('returns the installed app when the link points to an installed app', () => {
      const [option] = search('https://play.google.com/store/apps/details?id=com.whatsapp')
      expect(option).toMatchObject({ packageName: 'com.whatsapp', installed: true })
    })

    it('does not duplicate a package that is already listed', () => {
      expect(packagesOf('com.whatsapp')).toEqual(['com.whatsapp'])
    })

    it('uses the spelling of the known package whatever case the user typed', () => {
      expect(packagesOf('COM.WHATSAPP')).toEqual(['com.whatsapp'])
      expect(packagesOf('com.mihoyo.genshinimpact')).toEqual(['com.miHoYo.GenshinImpact'])
    })

    it('does not turn a web domain into a package option', () => {
      expect(packagesOf('instagram.com')).toEqual([])
    })
  })
})
