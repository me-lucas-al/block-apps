import { afterEach, beforeEach } from 'vitest'
import type { BackendFactory, TestBackend } from './testBackends'

export function useTestBackend(factory: BackendFactory, maxRulesPerUser?: number): () => TestBackend {
  let backend: TestBackend | undefined
  beforeEach(async () => {
    backend = await factory.create(maxRulesPerUser)
  })
  afterEach(async () => {
    await backend?.dispose()
  })
  return () => {
    if (!backend) throw new Error('test backend not ready')
    return backend
  }
}
