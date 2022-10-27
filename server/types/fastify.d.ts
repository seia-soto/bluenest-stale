import { TEncodedUserPayload } from '../src/models/jwt/index.js'
import { ECookieName } from '../src/types.js'

declare module 'fastify' {
  interface FastifyRequest {
    cookies: {
      [ECookieName.general]: string
      [ECookieName.postAuthorization]: string
    }
    session: TEncodedUserPayload
  }
}

export {}
