export class MalformedDnsSettingsError extends Error {
  constructor(userId: string) {
    super(`stored dns settings of user ${userId} are malformed`)
    this.name = 'MalformedDnsSettingsError'
  }
}
