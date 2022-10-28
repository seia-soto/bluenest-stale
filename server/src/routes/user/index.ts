import { FastifyPluginCallback } from 'fastify'
import { resolveJwtOnRequest } from '../../hooks/resolveJwtOnRequest.js'
import handler from './_.js'

const userRouter: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.addHook('onRequest', resolveJwtOnRequest)

  void fastify.register(handler, { prefix: '/' })

  done()
}

export default userRouter
