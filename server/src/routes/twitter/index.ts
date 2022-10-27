import { FastifyPluginCallback } from 'fastify'
import { resolveJwtOnRequest } from '../../hooks/resolveJwtOnRequest.js'
import { threadHandler } from './thread.js'
import { timelineHandler } from './timeline.js'

const twitterRouter: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.addHook('onRequest', resolveJwtOnRequest)

  void fastify.register(threadHandler, { prefix: '/thread' })
  void fastify.register(timelineHandler, { prefix: '/timeline' })

  done()
}

export default twitterRouter
