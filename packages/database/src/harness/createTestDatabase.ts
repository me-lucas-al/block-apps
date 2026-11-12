import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const MIGRATIONS_DIRECTORY = fileURLToPath(
  new URL('../../../../supabase/migrations', import.meta.url),
)
const PRELUDE_PATH = fileURLToPath(new URL('./prelude.sql', import.meta.url))

export type TestDatabase = {
  readonly db: PGlite
  createUser(email: string): Promise<string>
  actAs(userId: string): Promise<void>
  actAsAnonymous(): Promise<void>
  actAsAdmin(): Promise<void>
}

async function applyMigrations(db: PGlite): Promise<void> {
  await db.exec(readFileSync(PRELUDE_PATH, 'utf8'))
  const migrations = readdirSync(MIGRATIONS_DIRECTORY)
    .filter((name) => name.endsWith('.sql'))
    .sort()
  for (const migration of migrations) {
    await db.exec(readFileSync(join(MIGRATIONS_DIRECTORY, migration), 'utf8'))
  }
}

export async function createTestDatabase(): Promise<TestDatabase> {
  const db = new PGlite()
  await applyMigrations(db)

  const setSubject = (userId: string) =>
    db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId])

  return {
    db,
    async createUser(email) {
      await db.exec('reset role')
      const result = await db.query<{ id: string }>(
        'insert into auth.users (email) values ($1) returning id',
        [email],
      )
      return result.rows[0]!.id
    },
    async actAs(userId) {
      await db.exec('set role authenticated')
      await setSubject(userId)
    },
    async actAsAnonymous() {
      await db.exec('set role anon')
      await setSubject('')
    },
    async actAsAdmin() {
      await db.exec('reset role')
    },
  }
}
