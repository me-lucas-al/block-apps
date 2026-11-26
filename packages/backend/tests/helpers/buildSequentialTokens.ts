export function buildSequentialTokens(): () => string {
  let counter = 0
  return () => {
    counter += 1
    return `test-token-${counter}`
  }
}
