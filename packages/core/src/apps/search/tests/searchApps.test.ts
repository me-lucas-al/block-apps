import { describe, expect, it } from 'vitest'
import type { AppSuggestion, KnownApp } from '../../catalog/types'
import { buildAppLabeler } from '../buildAppLabeler'
import { searchApps } from '../searchApps'

const suggestions: AppSuggestion[] = [
  { packageName: 'com.instagram.android', label: 'Instagram', category: 'social' },
  { packageName: 'com.whatsapp', label: 'WhatsApp', category: 'messaging' },
  { packageName: 'com.spotify.music', label: 'Spotify', category: 'music' },
]

const installed: KnownApp[] = [
  { packageName: 'com.whatsapp', label: 'WhatsApp' },
  { packageName: 'com.example.calculator', label: 'Calculadora' },
  { packageName: 'com.example.agenda', label: 'Agenda' },
]

const search = (query: string) => searchApps({ installed, suggestions, query })

describe('searchApps', () => {
  it('lists suggestions first, then the remaining installed apps alphabetically', () => {
    expect(search('').map((option) => option.packageName)).toEqual([
      'com.instagram.android',
      'com.whatsapp',
      'com.spotify.music',
      'com.example.agenda',
      'com.example.calculator',
    ])
  })

  it('marks which options are installed and which are suggested', () => {
    const [instagram, whatsapp, , agenda] = search('')
    expect(instagram).toMatchObject({ installed: false, suggested: true })
    expect(whatsapp).toMatchObject({ installed: true, suggested: true })
    expect(agenda).toMatchObject({ installed: true, suggested: false })
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

  it('offers an unknown package name typed by the user as a custom option', () => {
    const [custom] = search('com.roblox.client')
    expect(custom).toEqual({
      packageName: 'com.roblox.client',
      label: 'com.roblox.client',
      installed: false,
      suggested: false,
    })
  })

  it('offers the package found in a Play Store link', () => {
    const [custom] = search('https://play.google.com/store/apps/details?id=com.roblox.client')
    expect(custom?.packageName).toBe('com.roblox.client')
  })

  it('does not duplicate a package that is already listed', () => {
    const results = search('com.whatsapp')
    expect(results).toHaveLength(1)
    expect(results[0]?.suggested).toBe(true)
  })

  it('returns nothing for text that matches no app', () => {
    expect(search('zzzz')).toEqual([])
  })
})

describe('buildAppLabeler', () => {
  const labelOf = buildAppLabeler(installed, suggestions)

  it('labels suggested apps that are not installed', () => {
    expect(labelOf('com.spotify.music')).toBe('Spotify')
  })

  it('prefers the label of the installed app', () => {
    const customLabel = buildAppLabeler([{ packageName: 'com.whatsapp', label: 'Zap' }], suggestions)
    expect(customLabel('com.whatsapp')).toBe('Zap')
  })

  it('falls back to the package name', () => {
    expect(labelOf('com.unknown.app')).toBe('com.unknown.app')
  })
})
