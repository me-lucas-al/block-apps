export function readRequiredEnvironment(name: string): string {
  const variable = process.env[name]
  if (!variable) throw new Error(`Missing environment variable ${name}`)
  return variable
}
