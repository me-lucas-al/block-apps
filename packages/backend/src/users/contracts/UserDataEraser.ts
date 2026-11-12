export interface UserDataEraser {
  eraseAllDataOf(userId: string): Promise<void>
}
