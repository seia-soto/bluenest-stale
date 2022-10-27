import { Static, Type } from '@sinclair/typebox'

export const enum EServerCacheStatus {
  Miss = 0,
  Hit,
  Stale,
  None
}

export const enum ETwitterLinkStatus {
  Disconnected = 0,
  Connected
}

export const ResponseMeta = Type.Object({
  cache: Type.Object({
    client: Type.Object({
      exp: Type.Number({
        minimum: -1,
        default: -1
      })
    }),
    server: Type.Object({
      iat: Type.Number({
        default: -1
      }),
      status: Type.Number({
        default: EServerCacheStatus.Miss
      })
    })
  })
})
export type TResponseMeta = Static<typeof ResponseMeta>

export const Response = Type.Object({
  meta: ResponseMeta
})
export type TResponse = Static<typeof Response>
