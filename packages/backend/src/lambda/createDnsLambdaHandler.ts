import { handle } from '@hono/aws-lambda'
import type { Hono } from 'hono'
import { createLazyHandler } from './createLazyHandler'

export function createDnsLambdaHandler(assembleDnsApp: () => Hono) {
  return createLazyHandler(() => handle(assembleDnsApp()))
}
