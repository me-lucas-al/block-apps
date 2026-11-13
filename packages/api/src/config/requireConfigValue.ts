export function requireConfigValue(variableName: string, configuredValue: string | undefined): string {
  if (!configuredValue) {
    throw new Error(`Missing client configuration: ${variableName}`)
  }
  return configuredValue
}
