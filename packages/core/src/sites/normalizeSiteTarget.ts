const HOSTNAME_PATTERN = /^([a-z0-9-]+\.)+[a-z0-9-]{2,}$/
const MAX_HOSTNAME_LENGTH = 253

function parseHostname(candidateUrl: string): string | null {
  try {
    return new URL(candidateUrl).hostname
  } catch {
    return null
  }
}

export function normalizeSiteTarget(input: string): string | null {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return null

  const candidateUrl = trimmed.includes('://') ? trimmed : `https://${trimmed}`
  const hostname = parseHostname(candidateUrl)
  if (!hostname) return null

  const withoutWww = hostname.replace(/^www\./, '')
  if (withoutWww.length > MAX_HOSTNAME_LENGTH) return null
  return HOSTNAME_PATTERN.test(withoutWww) ? withoutWww : null
}
