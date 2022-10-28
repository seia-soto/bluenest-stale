import { Type } from '@sinclair/typebox'
import { decode, encode } from 'cbor'
import { Response } from '../../../protocol/definitions.js'
import { Empty, ResponseWithData } from '../../../protocol/generators.js'
import { Post, PostFragment, TPostFragment } from '../../../protocol/schemas.js'
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

      const id: number = Number(request.params.id)

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

  fastify.route({
    url: '/:id',
    method: 'PATCH',
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      body: Type.Object({
        content: Type.Array(PostFragment),
        background: Type.String(),
        exert: Type.String(),
        is_published: Type.Boolean()
      }),
      response: {
        200: Response
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
          .count({ id, user_id: user.id })

        if (!one) {
          void reply.status(404)

          return response
        }

        await posts(t).update({ id }, {
          ...request.body,
          content: encode(request.body.content)
        })

        return response
      })
    }
  })

  fastify.route({
    url: '/:id',
    method: 'DELETE',
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: Response
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
          .count({ id, user_id: user.id })

        if (!one) {
          void reply.status(404)

          return response
        }

        await posts(t).delete({ id })

        return response
      })
    }
  })

  done()
}

export default handler
