import { onRequestAsyncHookHandler } from 'fastify'
import { Empty } from '../../protocol/generators.js'
import { obtain, TEncodedUserPayload, UserPayloadChecker } from '../models/jwt/index.js'
import { ECookieName } from '../types.js'

export const resolveJwtOnRequest: onRequestAsyncHookHandler = async (request, reply) => {
  const jwt = obtain<TEncodedUserPayload>(request.cookies[ECookieName.general] ?? '', UserPayloadChecker)

  if (!jwt) {
    void reply
      .clearCookie(ECookieName.general)
      .status(403)
      .send(Empty())

    return await reply
  }

  request.session = jwt
}
