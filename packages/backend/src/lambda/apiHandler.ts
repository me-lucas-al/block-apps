import { handle } from '@hono/aws-lambda'
import { createApiUseCases } from '../composition/createApiUseCases'
import { createDynamoStores } from '../composition/createDynamoStores'
import { createTableContext } from '../composition/createTableContext'
import { createApiApp } from '../http/app/createApiApp'
import { createLazyHandler } from './createLazyHandler'

export const apiHandler = createLazyHandler(() => {
  const stores = createDynamoStores(createTableContext())
  const useCases = createApiUseCases(stores, () => new Date())
  return handle(createApiApp(useCases))
})
