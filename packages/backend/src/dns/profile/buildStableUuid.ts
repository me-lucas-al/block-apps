import { createHash } from 'node:crypto'

export function buildStableUuid(seed: string): string {
  const hex = createHash('sha256').update(seed).digest('hex')
  const variant = ((parseInt(hex.charAt(16), 16) & 0x3) | 0x8).toString(16)
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-')
}
