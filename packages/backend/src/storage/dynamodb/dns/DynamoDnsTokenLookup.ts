import type { DnsTokenLookup, ValidatedDnsOwner } from '../../../dns/contracts/DnsTokenLookup'
import type { TableContext } from '../TableContext'
import { findValidatedDnsOwner } from './reads/findValidatedDnsOwner'

export class DynamoDnsTokenLookup implements DnsTokenLookup {
  constructor(private readonly context: TableContext) {}

  findValidatedDnsOwner(tokenHash: string): Promise<ValidatedDnsOwner | null> {
    return findValidatedDnsOwner(this.context, tokenHash)
  }
}
