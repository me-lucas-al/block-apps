export function logDnsError(message: string, error: unknown): void {
  const name = error instanceof Error ? error.name : 'UnknownError'
  const detail = error instanceof Error ? error.message : String(error)
  console.error(JSON.stringify({ message, name, detail }))
}
