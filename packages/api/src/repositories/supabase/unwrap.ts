type SupabaseResult<T> = {
  data: T | null
  error: { message: string } | null
}

export function unwrap<T>(result: SupabaseResult<T>): T {
  if (result.error) throw new Error(result.error.message)
  if (result.data === null) throw new Error('Supabase returned no data')
  return result.data
}

export function assertNoError(result: { error: { message: string } | null }): void {
  if (result.error) throw new Error(result.error.message)
}
