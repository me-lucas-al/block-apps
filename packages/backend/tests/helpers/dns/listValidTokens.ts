import type { TestBackend } from '../testBackends'
import { findOwnerOfToken } from './findOwnerOfToken'

export async function listValidTokens(backend: TestBackend, tokens: string[]): Promise<string[]> {
  const owners = await Promise.all(tokens.map((token) => findOwnerOfToken(backend, token)))
  return tokens.filter((_token, position) => owners[position] !== null)
}
