export function readBodyField(body: unknown, field: string): unknown {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>)[field] : undefined
}
