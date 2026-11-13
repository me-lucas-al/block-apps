import { describe, expect, it } from 'vitest'
import { incognitoSettingName } from '../incognitoSettingName'

describe('incognitoSettingName', () => {
  it('uses the chrome label for chrome', () => {
    expect(incognitoSettingName('chrome')).toBe('Permitir no modo anônimo')
  })

  it('uses the private window label for firefox', () => {
    expect(incognitoSettingName('firefox')).toBe('Executar em janelas privativas')
  })
})
