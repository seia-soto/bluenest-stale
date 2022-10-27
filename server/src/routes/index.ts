import { FastifyPluginCallback } from 'fastify'
import oauthRouter from './oauth/index.js'
import postRouter from './post/index.js'
import twitterRouter from './twitter/index.js'

const router: FastifyPluginCallback = (fastify, _opts, done) => {
  void fastify.register(oauthRouter, { prefix: '/oauth' })
  void fastify.register(twitterRouter, { prefix: '/twitter' })
  void fastify.register(postRouter, { prefix: '/post' })

  done()
}

export default router
