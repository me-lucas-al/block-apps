const MAX_BODY_BYTES = 16 * 1024

export async function readJsonBody(request: Request): Promise<unknown> {
  const rawBody = await request.text()
  if (rawBody.length > MAX_BODY_BYTES) return undefined
  try {
    return JSON.parse(rawBody)
  } catch {
    return undefined
  }
}
