export function isIncognitoAccessAllowed(): Promise<boolean> {
  return chrome.extension.isAllowedIncognitoAccess()
}
