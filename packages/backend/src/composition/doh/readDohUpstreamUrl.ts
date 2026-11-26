const DNS_UPSTREAM_VARIABLE = 'DNS_UPSTREAM_URL'
export const DEFAULT_DOH_UPSTREAM_URL = 'https://1.1.1.1/dns-query'

function rejectUpstreamUrl(reason: string): never {
  const detail = `${DNS_UPSTREAM_VARIABLE} ${reason}`
  console.error(JSON.stringify({ message: 'invalid dns upstream configuration', detail }))
  throw new Error(detail)
}

export function readDohUpstreamUrl(environment: NodeJS.ProcessEnv): string {
  const configuredUrl = environment[DNS_UPSTREAM_VARIABLE]?.trim()
  if (!configuredUrl) return DEFAULT_DOH_UPSTREAM_URL
  if (!URL.canParse(configuredUrl)) return rejectUpstreamUrl('must be a valid URL')
  const parsedUrl = new URL(configuredUrl)
  if (parsedUrl.protocol !== 'https:') return rejectUpstreamUrl('must use https')
  if (parsedUrl.username || parsedUrl.password) return rejectUpstreamUrl('must not embed credentials')
  return configuredUrl
}
