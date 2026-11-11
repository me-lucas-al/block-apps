const PACKAGE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/
const PLAY_STORE_HOST = 'play.google.com'
const PLAY_STORE_DETAILS_PATH = '/store/apps/details'

function parsePlayStoreUrl(input: string): URL | null {
  const withProtocol = input.includes('://') ? input : `https://${input}`
  try {
    return new URL(withProtocol)
  } catch {
    return null
  }
}

function extractPlayStorePackage(input: string): string | null {
  const url = parsePlayStoreUrl(input)
  if (!url || url.hostname !== PLAY_STORE_HOST) return null
  if (url.pathname !== PLAY_STORE_DETAILS_PATH) return null
  const packageName = url.searchParams.get('id')
  return packageName && PACKAGE_NAME_PATTERN.test(packageName) ? packageName : null
}

export function parseAppIdentifier(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (PACKAGE_NAME_PATTERN.test(trimmed)) return trimmed
  return extractPlayStorePackage(trimmed)
}
