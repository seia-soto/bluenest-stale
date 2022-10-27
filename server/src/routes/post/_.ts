import { Type } from '@sinclair/typebox'
import { decode } from 'cbor'
import { Empty, ResponseWithData } from '../../../protocol/generators.js'
import { Post, TPostFragment } from '../../../protocol/schemas.js'
import { db, posts } from '../../models/db/provider.js'
import { TFastifyTypedPluginCallback } from '../../types.js'

const handler: TFastifyTypedPluginCallback = (fastify, _opts, done) => {
  fastify.route({
    url: '/:id',
    method: 'GET',
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: ResponseWithData(Post)
      }
    },
    handler: async (request, reply) => {
      const response = Empty()

      const id = Number(request.params.id)

      if (isNaN(id)) {
        void reply.status(404)

        return response
      }

      const { user } = request.session

      return await db.tx(async t => {
        const one = await posts(t)
          .findOne({ id, user_id: user.id })

        if (!one) {
          void reply.status(404)

          return response
        }

        const content: TPostFragment[] = decode(one.content)

        return {
          ...response,
          payload: {
            ...one,
            content
          }
        }
      })
    }
  })

  done()
}

export default handler
