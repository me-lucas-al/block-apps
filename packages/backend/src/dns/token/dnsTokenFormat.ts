export const DNS_TOKEN_BYTES = 32
export const DNS_TOKEN_LENGTH = Math.ceil((DNS_TOKEN_BYTES * 4) / 3)

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/

export function isWellFormedDnsToken(token: string): boolean {
  return token.length === DNS_TOKEN_LENGTH && BASE64URL_PATTERN.test(token)
}
