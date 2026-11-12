type SupabaseResponse<Data> = {
  data: Data | null
  error: { message: string } | null
}

export function requireSupabaseData<Data>(response: SupabaseResponse<Data>): Data {
  if (response.error) throw new Error(response.error.message)
  if (response.data === null) throw new Error('Supabase returned no data')
  return response.data
}
