import { FastifyPluginCallback } from 'fastify'
import completeHandler from './complete.js'
import requestHandler from './request.js'
import revokeHandler from './revoke.js'

const oauthRouter: FastifyPluginCallback = (fastify, _opts, done) => {
  void fastify.register(requestHandler, { prefix: '/request' })
  void fastify.register(completeHandler, { prefix: '/complete' })
  void fastify.register(revokeHandler, { prefix: '/revoke' })

  done()
}

export default oauthRouter
