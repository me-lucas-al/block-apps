const PACKAGE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/
const WEB_DOMAIN_SUFFIXES = new Set(['com', 'org', 'net', 'br', 'me', 'gov', 'edu'])
const PLAY_STORE_HOST = 'play.google.com'
const PLAY_STORE_DETAILS_PATH = '/store/apps/details'

function isPackageName(candidate: string): boolean {
  if (!PACKAGE_NAME_PATTERN.test(candidate)) return false
  const lastSegment = candidate.split('.').at(-1)?.toLowerCase() ?? ''
  return !WEB_DOMAIN_SUFFIXES.has(lastSegment)
}

function parseUrl(input: string): URL | null {
  const withProtocol = input.includes('://') ? input : `https://${input}`
  try {
    return new URL(withProtocol)
  } catch {
    return null
  }
}

function extractPlayStorePackage(input: string): string | null {
  const url = parseUrl(input)
  if (!url || url.hostname !== PLAY_STORE_HOST) return null
  if (url.pathname !== PLAY_STORE_DETAILS_PATH) return null
  const packageName = url.searchParams.get('id')
  return packageName && isPackageName(packageName) ? packageName : null
}

export function parseAppIdentifier(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (isPackageName(trimmed)) return trimmed
  return extractPlayStorePackage(trimmed)
}
