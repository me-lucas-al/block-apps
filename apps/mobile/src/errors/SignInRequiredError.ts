export class SignInRequiredError extends Error {
  constructor() {
    super('Entre na sua conta para pedir a remoção do grupo.')
    this.name = 'SignInRequiredError'
  }
}
