import type { handle } from '@hono/aws-lambda'

export type LambdaHandler = ReturnType<typeof handle>

export function createLazyHandler(buildHandler: () => LambdaHandler): LambdaHandler {
  let builtHandler: LambdaHandler | undefined
  return (event, lambdaContext) => {
    builtHandler ??= buildHandler()
    return builtHandler(event, lambdaContext)
  }
}
