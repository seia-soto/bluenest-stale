import { ECookieName, TFastifyTypedPluginCallback } from '../../types.js'

export const revokeHandler: TFastifyTypedPluginCallback = (fastify, _opts, done) => {
  void fastify.route({
    url: '/',
    method: 'GET',
    handler: async (_request, reply) => {
      await reply
        .clearCookie(ECookieName.general)
        .clearCookie(ECookieName.postAuthorization)
        .redirect('/')
    }
  })

  done()
}

export default revokeHandler
