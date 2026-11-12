const LOCAL_WEB_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/
const BROWSER_EXTENSION_ORIGIN = /^chrome-extension:\/\/[a-p]{32}$/

export function isAllowedLocalOrigin(origin: string, extraOrigins: readonly string[]): boolean {
  return (
    LOCAL_WEB_ORIGIN.test(origin) ||
    BROWSER_EXTENSION_ORIGIN.test(origin) ||
    extraOrigins.includes(origin)
  )
}
