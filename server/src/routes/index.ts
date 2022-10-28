import { FastifyPluginCallback } from 'fastify'
import oauthRouter from './oauth/index.js'
import postRouter from './post/index.js'
import twitterRouter from './twitter/index.js'
import userRouter from './user/index.js'

const router: FastifyPluginCallback = (fastify, _opts, done) => {
  void fastify.register(oauthRouter, { prefix: '/oauth' })
  void fastify.register(twitterRouter, { prefix: '/twitter' })
  void fastify.register(postRouter, { prefix: '/post' })
  void fastify.register(userRouter, { prefix: '/user' })

  done()
}

export default router
