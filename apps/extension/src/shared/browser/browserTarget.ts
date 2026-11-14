export type BrowserTarget = 'chrome' | 'firefox'

export function parseBrowserTarget(rawTarget: string | undefined): BrowserTarget {
  if (rawTarget === undefined || rawTarget === '' || rawTarget === 'chrome') return 'chrome'
  if (rawTarget === 'firefox') return 'firefox'
  throw new Error(`Unknown browser target "${rawTarget}". Use "chrome" or "firefox".`)
}

export function readBrowserTarget(): BrowserTarget {
  return parseBrowserTarget(import.meta.env.VITE_TARGET_BROWSER)
}
