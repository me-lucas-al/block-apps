export interface UserRemover {
  remove(username: string): Promise<void>
}
