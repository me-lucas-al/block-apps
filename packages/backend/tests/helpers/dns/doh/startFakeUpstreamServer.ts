import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'

export type FakeUpstreamServer = {
  readonly url: string
  stop(): Promise<void>
}

export type FakeUpstreamBehavior = (request: IncomingMessage, reply: ServerResponse) => void

function listenOnFreePort(server: Server): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve((server.address() as AddressInfo).port))
  })
}

export async function startFakeUpstreamServer(
  behavior: FakeUpstreamBehavior,
): Promise<FakeUpstreamServer> {
  const server = createServer(behavior)
  const port = await listenOnFreePort(server)
  return {
    url: `http://127.0.0.1:${port}/dns-query`,
    stop: () =>
      new Promise((resolve) => {
        server.closeAllConnections()
        server.close(() => resolve())
      }),
  }
}
