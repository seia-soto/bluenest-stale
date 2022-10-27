import { Type } from '@sinclair/typebox'
import { encode } from 'cbor'
import { TweetV1 } from 'twitter-api-v2'
import { EServerCacheStatus } from '../../../protocol/definitions.js'
import { Empty, ResponseWithData } from '../../../protocol/generators.js'
import { EPostFragmentType, TPostFragment } from '../../../protocol/schemas.js'
import { db, posts } from '../../models/db/provider.js'
import { getCacheFor } from '../../models/keydb/index.js'
import { TFastifyTypedPluginCallback } from '../../types.js'

const composeHandler: TFastifyTypedPluginCallback = (fastify, _opts, done) => {
  void fastify.route({
    url: '/:id',
    method: 'GET',
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: ResponseWithData(Type.Number())
      }
    },
    handler: async (request, reply) => {
      const response = Empty()

      response.meta.cache.server.status = EServerCacheStatus.None

      const { user, twitter } = request.session
      const id: string = request.params.id // Don't know but sometimes type inference is broken tho

      if (isNaN(parseInt(id))) {
        void reply.status(404)

        return response
      }

      return await db.tx(async t => {
        const queried = await posts(t)
          .find({ user_id: user.id, tweet_id: id })
          .select('id')
          .one()

        if (queried) {
          // Just a marker for the client
          response.meta.cache.server.status = EServerCacheStatus.Hit

          return {
            ...response,
            payload: queried.id
          }
        }

        // We assume that users will always pass /api/twitter/* before
        const fragments: TPostFragment[] = []

        for (let lookupId = id; ;) {
          const cacheKey = 'twitterv1.tweet.' + lookupId
          const cache = await getCacheFor<TweetV1>(cacheKey)

          if (!cache) {
            void reply.status(404)

            return response
          }

          const { data: tweet } = cache

          if (
            !tweet ||
            tweet.user.id_str !== twitter.user.id
          ) {
            void reply.status(404)

            return response
          }

          if (!tweet.in_reply_to_status_id_str) {
            break
          }

          lookupId = tweet.in_reply_to_status_id_str

          // Convert into ours
          const text = tweet?.full_text ?? tweet?.text

          if (typeof text === 'string') {
            fragments.push({
              type: EPostFragmentType.Text,
              source: text,
              options: {
                isBold: false,
                isHighlighted: false,
                isUnderlined: false,
                headingLevel: 0
              }
            })
          }

          tweet?.entities?.media?.forEach(media => {
            switch (media.type) {
              case 'animated_gif':
              case 'photo':
              {
                fragments.push({
                  type: EPostFragmentType.Image,
                  source: media.media_url_https,
                  options: {
                    isLandscape: false,
                    height: 0
                  }
                })

                break
              }

              case 'video':
              {
                fragments.push({
                  type: EPostFragmentType.Video,
                  source: media.media_url_https,
                  options: {
                    isLandscape: false,
                    height: 0
                  }
                })

                break
              }
            }
          })
        }

        const [post] = await posts(t).insert({
          tweet_id: id,
          user_id: user.id,
          content: encode(fragments),
          exert: '',
          background: '',
          is_published: false
        })

        return {
          ...response,
          payload: post.id
        }
      })
    }
  })

  done()
}

export default composeHandler
