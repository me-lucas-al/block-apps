import { PGlite } from '@electric-sql/pglite'
import type { TestDatabase } from './TestDatabase'
import { applyMigrations } from './applyMigrations'
import { createDatabaseActors } from './createDatabaseActors'

export type { TestDatabase } from './TestDatabase'

export async function createTestDatabase(): Promise<TestDatabase> {
  const db = new PGlite()
  await applyMigrations(db)
  return { db, ...createDatabaseActors(db) }
}
