export interface IncognitoPort {
  readonly settingName: string
  readonly openSettingsLabel: string
  isAllowed(): Promise<boolean>
  openSettings(): Promise<void>
}
