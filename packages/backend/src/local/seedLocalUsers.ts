import { FakeCognito } from './cognito/FakeCognito'
import { DEV_ADMIN_ID, DEV_USER_ID } from './devUsers'

export function seedLocalUsers(): FakeCognito {
  const cognito = new FakeCognito()
  cognito.addUser({ sub: DEV_ADMIN_ID, email: 'admin@local.test', name: 'Admin local', groups: new Set(['admin']) })
  cognito.addUser({ sub: DEV_USER_ID, email: 'user@local.test', name: 'Usuario local', groups: new Set(['user']) })
  return cognito
}
