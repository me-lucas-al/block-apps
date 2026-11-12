import type { SupabaseClient } from '@supabase/supabase-js'

export class AdminApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'AdminApiError'
  }
}

type FailureResponse = { context?: { json?: () => Promise<unknown> } }
type ErrorBody = { error?: { code?: string; message?: string } }

async function toAdminApiError(failure: FailureResponse & Error): Promise<AdminApiError> {
  try {
    const body = (await failure.context?.json?.()) as ErrorBody | undefined
    if (body?.error?.code) return new AdminApiError(body.error.code, body.error.message ?? failure.message)
  } catch {
    return new AdminApiError('unknown', failure.message)
  }
  return new AdminApiError('unknown', failure.message)
}

export async function invokeAdminFunction<T>(client: SupabaseClient, body: object): Promise<T> {
  const { data, error } = await client.functions.invoke('admin-users', { body })
  if (error) throw await toAdminApiError(error as FailureResponse & Error)
  return data as T
}
