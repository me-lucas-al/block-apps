export class RemovalRequestBlocksEditingError extends Error {
  constructor() {
    super('Cancele o pedido de remoção do grupo antes de editar os apps.')
    this.name = 'RemovalRequestBlocksEditingError'
  }
}

export class PendingRuleEditBlocksRemovalError extends Error {
  constructor() {
    super('Há uma alteração de horário pendente neste grupo. Cancele ou espere antes de remover apps.')
    this.name = 'PendingRuleEditBlocksRemovalError'
  }
}
