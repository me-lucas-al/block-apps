import { handle } from '@hono/aws-lambda'
import { readRequiredEnvironment } from '../composition/readRequiredEnvironment'
import { createAdminApp } from '../http/app/createAdminApp'
import { createLazyHandler } from './createLazyHandler'

export const adminHandler = createLazyHandler(() =>
  handle(createAdminApp(readRequiredEnvironment('ADMIN_GROUP_NAME'))),
)
