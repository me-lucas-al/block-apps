import type { PGlite } from '@electric-sql/pglite'

export type TestDatabase = {
  readonly db: PGlite
  createUser(email: string): Promise<string>
  actAs(userId: string): Promise<void>
  actAsAnonymous(): Promise<void>
  actAsAdmin(): Promise<void>
}
