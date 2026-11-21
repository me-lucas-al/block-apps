import { buildStableUuid } from './buildStableUuid'
import {
  PROFILE_DESCRIPTION,
  PROFILE_DISPLAY_NAME,
  PROFILE_IDENTIFIER_PREFIX,
  PROFILE_ORGANIZATION,
  SETTINGS_DISPLAY_NAME,
  SETTINGS_IDENTIFIER_PREFIX,
} from './dnsProfileTexts'
import { escapeXml } from './escapeXml'

export type DnsProfileInput = {
  readonly userId: string
  readonly token: string
  readonly dnsHostname: string
}

export function buildDnsProfile({ userId, token, dnsHostname }: DnsProfileInput): string {
  const serverUrl = escapeXml(`https://${dnsHostname}/dns-query/${token}`)
  const profileUuid = buildStableUuid(`profile:${userId}`)
  const settingsUuid = buildStableUuid(`dns-settings:${userId}`)
  const profileIdentifier = escapeXml(`${PROFILE_IDENTIFIER_PREFIX}.${profileUuid}`)
  const settingsIdentifier = escapeXml(`${SETTINGS_IDENTIFIER_PREFIX}.${settingsUuid}`)
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadType</key><string>Configuration</string>
  <key>PayloadVersion</key><integer>1</integer>
  <key>PayloadIdentifier</key><string>${profileIdentifier}</string>
  <key>PayloadUUID</key><string>${escapeXml(profileUuid)}</string>
  <key>PayloadDisplayName</key><string>${escapeXml(PROFILE_DISPLAY_NAME)}</string>
  <key>PayloadDescription</key><string>${escapeXml(PROFILE_DESCRIPTION)}</string>
  <key>PayloadOrganization</key><string>${escapeXml(PROFILE_ORGANIZATION)}</string>
  <key>PayloadRemovalDisallowed</key><false/>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key><string>com.apple.dnsSettings.managed</string>
      <key>PayloadVersion</key><integer>1</integer>
      <key>PayloadIdentifier</key><string>${settingsIdentifier}</string>
      <key>PayloadUUID</key><string>${escapeXml(settingsUuid)}</string>
      <key>PayloadDisplayName</key><string>${escapeXml(SETTINGS_DISPLAY_NAME)}</string>
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
