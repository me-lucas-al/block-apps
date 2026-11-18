import { describe, expect, it } from 'vitest'
import { buildDnsProfile } from '../../src/dns/profile/buildDnsProfile'
import { extractPayloadUuids } from '../helpers/extractPayloadUuids'

describe('buildDnsProfile', () => {
  it('renders an Apple DNS settings mobileconfig plist with the token ServerURL', () => {
    const xml = buildDnsProfile({
      userId: 'user-1',
      token: 'tok-abc',
      dnsHost: 'dns.lucasalmeidasouza.com',
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
            <key>PayloadIdentifier</key><string>com.blockapps.dns.dns.06c49a03-ab52-4c2a-ac26-86ba52fd8657</string>
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

  it('keeps the same UUIDs across token rotations for the same user', () => {
    const first = buildDnsProfile({ userId: 'user-1', token: 'tok-1', dnsHost: 'dns.example.test' })
    const second = buildDnsProfile({ userId: 'user-1', token: 'tok-2', dnsHost: 'dns.example.test' })
    const otherUser = buildDnsProfile({ userId: 'user-2', token: 'tok-1', dnsHost: 'dns.example.test' })

    const firstUuids = extractPayloadUuids(first)
    expect(firstUuids).toHaveLength(2)
    expect(firstUuids[0]).not.toBe(firstUuids[1])
    expect(extractPayloadUuids(second)).toEqual(firstUuids)
    expect(extractPayloadUuids(otherUser)).not.toEqual(firstUuids)
  })

  it('escapes XML special characters in the ServerURL', () => {
    const xml = buildDnsProfile({
      userId: 'user-1',
      token: 'a&b<c>"d"\'e\'',
      dnsHost: 'https://dns.example.test/',
    })

    expect(xml).toContain('<string>https://dns.example.test/dns-query/a&amp;b&lt;c&gt;&quot;d&quot;&apos;e&apos;</string>')
  })
})
