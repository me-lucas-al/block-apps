export class SessionRevocationError extends Error {
  constructor(readonly revocationFailure: unknown) {
    super('Could not revoke the session on the server')
    this.name = 'SessionRevocationError'
  }
}
