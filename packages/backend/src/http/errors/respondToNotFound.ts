import type { Context } from 'hono'

export function respondToNotFound(context: Context) {
  return context.json({ error: 'not found' }, 404)
}
