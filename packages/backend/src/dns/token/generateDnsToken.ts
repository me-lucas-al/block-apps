import { randomBytes } from 'node:crypto'
import { DNS_TOKEN_BYTES } from './dnsTokenFormat'

export type DnsTokenGenerator = () => string

export const generateDnsToken: DnsTokenGenerator = () =>
  randomBytes(DNS_TOKEN_BYTES).toString('base64url')
