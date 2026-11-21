import { assembleDynamoDohResolverApp } from '../composition/doh/assembleDynamoDohResolverApp'
import { createTableContext } from '../composition/createTableContext'
import { createDnsLambdaHandler } from './createDnsLambdaHandler'

export const dnsHandler = createDnsLambdaHandler(() =>
  assembleDynamoDohResolverApp(createTableContext(), process.env),
)
