export type UserRole = 'user' | 'admin'

export type AdminUser = {
  readonly id: string
  readonly email: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly cooldownHours: number
  readonly mustChangePassword: boolean
  readonly createdAt: string
  readonly lastSignInAt: string | null
}

export type CreateUserInput = {
  readonly email: string
  readonly password: string
  readonly displayName: string | null
  readonly role: UserRole
  readonly cooldownHours: number
  readonly mustChangePassword: boolean
}

export type UpdateUserInput = Partial<CreateUserInput>

export interface UserDirectory {
  find(userId: string): Promise<AdminUser | null>
  list(): Promise<AdminUser[]>
  countAdmins(): Promise<number>
  create(newUser: CreateUserInput): Promise<AdminUser>
  update(userId: string, changes: UpdateUserInput): Promise<AdminUser>
  remove(userId: string): Promise<void>
}
