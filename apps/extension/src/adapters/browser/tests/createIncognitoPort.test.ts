import { describe, expect, it } from 'vitest'
import { ChromeIncognitoPort } from '../../chrome/browser/ChromeIncognitoPort'
import { FirefoxIncognitoPort } from '../../firefox/FirefoxIncognitoPort'
import { createIncognitoPort } from '../createIncognitoPort'

describe('createIncognitoPort', () => {
  it('picks the chrome port for chrome', () => {
    expect(createIncognitoPort('chrome')).toBeInstanceOf(ChromeIncognitoPort)
  })

  it('picks the firefox port for firefox', () => {
    expect(createIncognitoPort('firefox')).toBeInstanceOf(FirefoxIncognitoPort)
  })
})
