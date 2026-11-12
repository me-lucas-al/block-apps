export function throwIfSupabaseError(response: { error: { message: string } | null }): void {
  if (response.error) throw new Error(response.error.message)
}
