import { FastifyPluginCallback } from 'fastify'
import { resolveJwtOnRequest } from '../../hooks/resolveJwtOnRequest.js'
import composeHandler from './compose.js'
import handler from './_.js'

const postRouter: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.addHook('onRequest', resolveJwtOnRequest)

  void fastify.register(handler, { prefix: '/' })
  void fastify.register(composeHandler, { prefix: '/compose' })

  done()
}

export default postRouter
