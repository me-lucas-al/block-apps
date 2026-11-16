export class StrictModeAuthorizationRequiredError extends Error {
  constructor() {
    super('Autorize o Tempo de Uso antes de ligar o modo estrito.')
    this.name = 'StrictModeAuthorizationRequiredError'
  }
}
