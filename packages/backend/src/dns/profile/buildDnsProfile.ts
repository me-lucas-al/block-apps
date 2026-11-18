import { buildStableUuid } from './buildStableUuid'
import { escapeXml } from './escapeXml'

export type DnsProfileInput = {
  readonly userId: string
  readonly token: string
  readonly dnsHost: string
}

const PROFILE_IDENTIFIER = 'com.blockapps.dns'
const PROFILE_NAME = 'Block Apps: bloqueio de sites'

export function buildDnsProfile({ userId, token, dnsHost }: DnsProfileInput): string {
  const cleanHost = dnsHost.replace(/^https?:\/\//, '').replace(/\/+$/, '')
  const serverUrl = escapeXml(`https://${cleanHost}/dns-query/${token}`)
  const outerUuid = buildStableUuid(`profile:${userId}`)
  const innerUuid = buildStableUuid(`dns-settings:${userId}`)
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadType</key><string>Configuration</string>
  <key>PayloadVersion</key><integer>1</integer>
  <key>PayloadIdentifier</key><string>${PROFILE_IDENTIFIER}.${outerUuid}</string>
  <key>PayloadUUID</key><string>${outerUuid}</string>
  <key>PayloadDisplayName</key><string>${escapeXml(PROFILE_NAME)}</string>
  <key>PayloadDescription</key><string>Bloqueia os sites das suas regras usando um DNS seguro.</string>
  <key>PayloadOrganization</key><string>Block Apps</string>
  <key>PayloadRemovalDisallowed</key><false/>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key><string>com.apple.dnsSettings.managed</string>
      <key>PayloadVersion</key><integer>1</integer>
      <key>PayloadIdentifier</key><string>${PROFILE_IDENTIFIER}.dns.${innerUuid}</string>
      <key>PayloadUUID</key><string>${innerUuid}</string>
      <key>PayloadDisplayName</key><string>DNS seguro do Block Apps</string>
      <key>DNSSettings</key>
      <dict>
        <key>DNSProtocol</key><string>HTTPS</string>
        <key>ServerURL</key><string>${serverUrl}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>
`
}
