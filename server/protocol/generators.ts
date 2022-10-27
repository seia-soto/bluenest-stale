import { TSchema, Type } from '@sinclair/typebox'
import { EServerCacheStatus, ResponseMeta, TResponse } from './definitions.js'

export const Empty = (): TResponse => ({
  meta: {
    cache: {
      client: {
        exp: -1
      },
      server: {
        iat: -1,
        status: EServerCacheStatus.Miss
      }
    }
  }
})

export const ResponseWithData = <T extends TSchema>(data: T) => Type.Object({
  meta: ResponseMeta,
  payload: Type.Optional(data)
})
