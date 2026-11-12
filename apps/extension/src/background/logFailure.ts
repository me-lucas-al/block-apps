export function logFailure(task: string) {
  return (error: unknown) => console.error(`[block-apps] ${task} failed`, error)
}
