import type { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PRELUDE_DIRECTORY = fileURLToPath(new URL('./prelude', import.meta.url))
const MIGRATIONS_DIRECTORY = fileURLToPath(new URL('../../../../supabase/migrations', import.meta.url))

async function executeSqlFilesIn(db: PGlite, directory: string): Promise<void> {
  const sqlFileNames = readdirSync(directory)
    .filter((name) => name.endsWith('.sql'))
    .sort()
  for (const sqlFileName of sqlFileNames) {
    await db.exec(readFileSync(join(directory, sqlFileName), 'utf8'))
  }
}

export async function applyMigrations(db: PGlite): Promise<void> {
  await executeSqlFilesIn(db, PRELUDE_DIRECTORY)
  await executeSqlFilesIn(db, MIGRATIONS_DIRECTORY)
}
