import { randomBytes } from 'node:crypto'

const TOKEN_BYTES = 32

export type DnsTokenGenerator = () => string

export const generateDnsToken: DnsTokenGenerator = () =>
  randomBytes(TOKEN_BYTES).toString('base64url')
