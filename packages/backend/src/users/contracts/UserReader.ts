import type { DirectoryUser } from '../model/DirectoryUser'

export interface UserReader {
  find(userId: string): Promise<DirectoryUser | null>
  list(): Promise<DirectoryUser[]>
  countAdmins(): Promise<number>
}
