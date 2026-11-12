export function readGroupsClaim(claim: unknown): string[] {
  if (Array.isArray(claim)) return claim.filter((group) => typeof group === 'string')
  if (typeof claim !== 'string') return []
  return claim
    .replace(/^\[|\]$/g, '')
    .split(/[\s,]+/)
    .filter((group) => group.length > 0)
}
