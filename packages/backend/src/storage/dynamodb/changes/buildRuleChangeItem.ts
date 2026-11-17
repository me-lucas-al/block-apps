import type { PendingRuleChange } from '@block-apps/core'

type RuleKey = { readonly pk: string; readonly sk: string }

export function buildRuleChangeItem(tableName: string, ruleKey: RuleKey, change: PendingRuleChange) {
  const ruleMustExist = {
    TableName: tableName,
    Key: ruleKey,
    ConditionExpression: 'attribute_exists(pk)',
  }
  if (change.kind === 'delete') return { Delete: ruleMustExist }
  if (change.kind === 'selectionRemoval') return { ConditionCheck: ruleMustExist }
  return {
    Update: {
      ...ruleMustExist,
      UpdateExpression: 'SET #mode = :mode, #windows = :windows',
      ExpressionAttributeNames: { '#mode': 'mode', '#windows': 'windows' },
      ExpressionAttributeValues: { ':mode': change.mode, ':windows': change.windows },
    },
  }
}
