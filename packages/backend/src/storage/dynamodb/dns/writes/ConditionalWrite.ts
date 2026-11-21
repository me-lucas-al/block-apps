import type { TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb'

export type ConditionalWrite = NonNullable<TransactWriteCommandInput['TransactItems']>[number]
