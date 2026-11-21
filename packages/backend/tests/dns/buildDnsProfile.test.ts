import { describe, expect, it } from 'vitest'
import { buildDnsProfile } from '../../src/dns/profile/buildDnsProfile'
import { extractPayloadUuids } from '../helpers/extractPayloadUuids'
import { findPlistStringValues } from '../helpers/dns/parsePlistStringEntries'

const DNS_HOSTNAME = 'dns.example.test'

function buildProfileFor(userId: string, token: string): string {
  return buildDnsProfile({ userId, token, dnsHostname: DNS_HOSTNAME })
}

describe('buildDnsProfile', () => {
  it('renders an Apple DNS settings mobileconfig plist with the token ServerURL', () => {
    const xml = buildDnsProfile({
      userId: 'user-1',
      token: 'tok-abc',
      dnsHostname: 'dns.lucasalmeidasouza.com',
    })

    expect(xml).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
      <plist version="1.0">
      <dict>
        <key>PayloadType</key><string>Configuration</string>
        <key>PayloadVersion</key><integer>1</integer>
        <key>PayloadIdentifier</key><string>com.blockapps.dns.faa80f20-5185-4641-9cb9-e5d1fd2b6f1c</string>
        <key>PayloadUUID</key><string>faa80f20-5185-4641-9cb9-e5d1fd2b6f1c</string>
        <key>PayloadDisplayName</key><string>Block Apps: bloqueio de sites</string>
        <key>PayloadDescription</key><string>Bloqueia os sites das suas regras usando um DNS seguro.</string>
        <key>PayloadOrganization</key><string>Block Apps</string>
        <key>PayloadRemovalDisallowed</key><false/>
        <key>PayloadContent</key>
        <array>
          <dict>
            <key>PayloadType</key><string>com.apple.dnsSettings.managed</string>
            <key>PayloadVersion</key><integer>1</integer>
            <key>PayloadIdentifier</key><string>com.blockapps.dns.settings.06c49a03-ab52-4c2a-ac26-86ba52fd8657</string>
            <key>PayloadUUID</key><string>06c49a03-ab52-4c2a-ac26-86ba52fd8657</string>
            <key>PayloadDisplayName</key><string>DNS seguro do Block Apps</string>
            <key>DNSSettings</key>
            <dict>
              <key>DNSProtocol</key><string>HTTPS</string>
              <key>ServerURL</key><string>https://dns.lucasalmeidasouza.com/dns-query/tok-abc</string>
            </dict>
          </dict>
        </array>
      </dict>
      </plist>
      "
    `)
  })

  it('renders a well-formed plist that points to the DoH ServerURL over HTTPS', () => {
    const xml = buildProfileFor('user-1', 'tok-abc')

    expect(findPlistStringValues(xml, 'ServerURL')).toEqual([
      'https://dns.example.test/dns-query/tok-abc',
    ])
    expect(findPlistStringValues(xml, 'DNSProtocol')).toEqual(['HTTPS'])
    expect(findPlistStringValues(xml, 'PayloadType')).toEqual([
      'Configuration',
      'com.apple.dnsSettings.managed',
    ])
  })

  it('gives every payload an identifier without a repeated dns segment', () => {
    const identifiers = findPlistStringValues(buildProfileFor('user-1', 'tok-abc'), 'PayloadIdentifier')
    const [profileUuid, settingsUuid] = extractPayloadUuids(buildProfileFor('user-1', 'tok-abc'))

    expect(identifiers).toEqual([
      `com.blockapps.dns.${profileUuid}`,
      `com.blockapps.dns.settings.${settingsUuid}`,
    ])
  })

  it('keeps the same UUIDs across token rotations for the same user', () => {
    const firstUuids = extractPayloadUuids(buildProfileFor('user-1', 'tok-1'))

    expect(firstUuids).toHaveLength(2)
    expect(firstUuids[0]).not.toBe(firstUuids[1])
    expect(extractPayloadUuids(buildProfileFor('user-1', 'tok-2'))).toEqual(firstUuids)
    expect(extractPayloadUuids(buildProfileFor('user-2', 'tok-1'))).not.toEqual(firstUuids)
  })

  it('keeps a malicious token inert and recoverable after parsing the XML', () => {
    const maliciousToken = `a&b<c>"d"'e'</string><key>Evil</key><string>x`

    const xml = buildProfileFor('user-1', maliciousToken)

    expect(findPlistStringValues(xml, 'Evil')).toEqual([])
    expect(findPlistStringValues(xml, 'ServerURL')).toEqual([
      `https://dns.example.test/dns-query/${maliciousToken}`,
    ])
    expect(xml).toContain('a&amp;b&lt;c&gt;&quot;d&quot;&apos;e&apos;&lt;/string&gt;')
  })
})
