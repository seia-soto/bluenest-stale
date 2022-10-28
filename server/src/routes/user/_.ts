import { Type } from '@sinclair/typebox'
import { Response } from '../../../protocol/definitions.js'
import { Empty, ResponseWithData } from '../../../protocol/generators.js'
import { TUser, User } from '../../../protocol/schemas.js'
import { db, posts, users } from '../../models/db/provider.js'
import { ECookieName, TFastifyTypedPluginCallback } from '../../types.js'

const handler: TFastifyTypedPluginCallback = (fastify, _opts, done) => {
  fastify.route({
    url: '/',
    method: 'GET',
    schema: {
      response: {
        200: ResponseWithData(User)
      }
    },
    handler: async (request, _reply) => await db.tx(async t => {
      const resposne = Empty()

      const one = await users(t).findOne({ id: request.session.user.id }) as TUser

      return {
        ...resposne,
        one
      }
    })
  })

  fastify.route({
    url: '/',
    method: 'PATCH',
    schema: {
      body: Type.Object({
        name: Type.String(),
        avatar: Type.String()
      }),
      response: {
        200: Response
      }
    },
    handler: async (request, reply) => await db.tx(async t => {
      const response = Empty()

      await users(t).update({ id: request.session.user.id }, request.body)

      return response
    })
  })

  fastify.route({
    url: '/',
    method: 'DELETE',
    handler: async (request, reply) => await db.tx(async t => {
      const id = request.session.user.id

      await posts(t).delete({ user_id: id })
      await users(t).delete({ id })

      void reply
        .clearCookie(ECookieName.general)
        .redirect('/')
    })
  })

  done()
}

export default handler
