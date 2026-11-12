import { describe, expect, it } from 'vitest'
import type { AppSuggestion, KnownApp } from '../../catalog/appSuggestion'
import { buildAppLabeler } from '../buildAppLabeler'

const suggestions: AppSuggestion[] = [
  { packageName: 'com.spotify.music', label: 'Spotify', category: 'music' },
  { packageName: 'com.whatsapp', label: 'WhatsApp', category: 'messaging' },
]

const installed: KnownApp[] = [{ packageName: 'com.example.agenda', label: 'Agenda' }]

describe('buildAppLabeler', () => {
  const labelOf = buildAppLabeler(installed, suggestions)

  it('labels suggested apps that are not installed', () => {
    expect(labelOf('com.spotify.music')).toBe('Spotify')
  })

  it('labels installed apps that are not suggested', () => {
    expect(labelOf('com.example.agenda')).toBe('Agenda')
  })

  it('prefers the label of the installed app', () => {
    const customLabel = buildAppLabeler([{ packageName: 'com.whatsapp', label: 'Zap' }], suggestions)
    expect(customLabel('com.whatsapp')).toBe('Zap')
  })

  it('falls back to the package name', () => {
    expect(labelOf('com.unknown.app')).toBe('com.unknown.app')
  })
})
