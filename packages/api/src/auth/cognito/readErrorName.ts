export function readErrorName(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null
  if ('code' in error && typeof error.code === 'string') return error.code
  if ('name' in error && typeof error.name === 'string') return error.name
  return null
}
