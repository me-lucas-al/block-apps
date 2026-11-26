export function extractPayloadUuids(xml: string): string[] {
  const matches = xml.matchAll(/<key>PayloadUUID<\/key><string>([^<]+)<\/string>/g)
  return Array.from(matches, (match) => match[1] ?? '')
}
