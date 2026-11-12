import type { PGlite } from '@electric-sql/pglite'
import type { TestDatabase } from './TestDatabase'

export function createDatabaseActors(db: PGlite): Omit<TestDatabase, 'db'> {
  const setRequestSubject = (userId: string) =>
    db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId])

  return {
    async createUser(email) {
      await db.exec('reset role')
      const insertedUser = await db.query<{ id: string }>(
        'insert into auth.users (email) values ($1) returning id',
        [email],
      )
      return insertedUser.rows[0]!.id
    },
    async actAs(userId) {
      await db.exec('set role authenticated')
      await setRequestSubject(userId)
    },
    async actAsAnonymous() {
      await db.exec('set role anon')
      await setRequestSubject('')
    },
    async actAsAdmin() {
      await db.exec('reset role')
    },
  }
}
