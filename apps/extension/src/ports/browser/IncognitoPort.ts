export interface IncognitoPort {
  isAllowed(): Promise<boolean>
  openSettings(): Promise<void>
}
