import { hashDnsToken } from '../../../../dns/token/hashDnsToken'
import type { TableContext } from '../../TableContext'
import { dnsTokenLookupKey } from '../items/dnsKeys'
import type { ConditionalWrite } from './ConditionalWrite'

export function putDnsTokenLookupWrite(
  context: TableContext,
  userId: string,
  token: string,
): ConditionalWrite {
  return {
    Put: {
      TableName: context.tableName,
      Item: { ...dnsTokenLookupKey(hashDnsToken(token)), userId },
      ConditionExpression: 'attribute_not_exists(pk)',
    },
  }
}
