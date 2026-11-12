import { Hono } from 'hono'
import type { AdminUseCases } from '../app/AdminUseCases'
import type { ApiEnv } from '../app/ApiEnv'
import { readJsonBody } from '../parsing/bodies/readJsonBody'
import { readUserIdParam } from '../parsing/fields/readUserIdParam'
import { parseCreateUserBody } from '../parsing/users/bodies/parseCreateUserBody'
import { parseUpdateUserBody } from '../parsing/users/bodies/parseUpdateUserBody'

export function createUsersRoutes(useCases: AdminUseCases) {
  const routes = new Hono<ApiEnv>()

  routes.get('/', async (context) => {
    return context.json(await useCases.listUsers.listUsers(context.var.user.userId))
  })

  routes.post('/', async (context) => {
    const input = parseCreateUserBody(await readJsonBody(context))
    const createdUser = await useCases.createUser.createUser(context.var.user.userId, input)
    return context.json(createdUser, 201)
  })

  routes.patch('/:userId', async (context) => {
    const changes = parseUpdateUserBody(await readJsonBody(context))
    const updatedUser = await useCases.updateUser.updateUser(
      context.var.user.userId,
      readUserIdParam(context),
      changes,
    )
    return context.json(updatedUser)
  })

  routes.delete('/:userId', async (context) => {
    await useCases.deleteUser.deleteUser(context.var.user.userId, readUserIdParam(context))
    return context.body(null, 204)
  })

  return routes
}
