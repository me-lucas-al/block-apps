export function buildWellFormedDnsToken(seed: number): string {
  return Buffer.alloc(32, seed).toString('base64url')
}
