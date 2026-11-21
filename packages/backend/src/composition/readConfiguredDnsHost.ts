const DNS_HOST_VARIABLE = 'DNS_HOST'
const HOSTNAME_PATTERN = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/

export function readConfiguredDnsHost(environment: NodeJS.ProcessEnv): string | undefined {
  const configuredHost = environment[DNS_HOST_VARIABLE]?.trim()
  if (!configuredHost) return undefined
  if (HOSTNAME_PATTERN.test(configuredHost)) return configuredHost
  const detail = `${DNS_HOST_VARIABLE} must be a bare lowercase hostname without scheme, port or path, received "${configuredHost}"`
  console.error(JSON.stringify({ message: 'invalid dns host configuration', detail }))
  throw new Error(detail)
}
