import { Type } from '@sinclair/typebox'
import { TweetV1 } from 'twitter-api-v2'
import { EServerCacheStatus } from '../../../protocol/definitions.js'
import { Empty, ResponseWithData } from '../../../protocol/generators.js'
import { TwitterTweet } from '../../../protocol/schemas.js'
import { createClient, getTweetOrCached } from '../../models/twitter/index.js'
import { TFastifyTypedPluginCallback } from '../../types.js'

const CLIENT_CACHE_TTL = 1000 * 30

export const threadHandler: TFastifyTypedPluginCallback = (fastify, _opts, done) => {
  fastify.route({
    url: '/:id',
    method: 'GET',
    schema: {
      params: Type.Object({
        id: Type.String()
      }),
      response: {
        200: ResponseWithData(Type.Array(TwitterTweet))
      }
    },
    handler: async (request, reply) => {
      const response = Empty()

      response.meta.cache.client.exp = CLIENT_CACHE_TTL
      response.meta.cache.server.status = EServerCacheStatus.None

      const { twitter } = request.session
      let { id } = request.params

      if (isNaN(parseInt(id))) {
        void reply.status(404)

        return response
      }

      const { accessToken, accessSecret } = twitter.token
      const client = createClient({ accessToken, accessSecret })

      const isAccessGranted = await client.v1.verifyCredentials()
        .catch(_ => false as const)

      if (!isAccessGranted) {
        response.meta.cache.server.status = EServerCacheStatus.Stale

        return response
      }

      const tweets: TweetV1[] = []

      for (; ;) {
        const tweet = await getTweetOrCached(client, id)

        if (
          !tweet ||
          tweet.user.id_str !== twitter.user.id
        ) {
          break
        }

        tweets.push(tweet)

        if (!tweet.in_reply_to_status_id_str) {
          break
        }

        id = tweet.in_reply_to_status_id_str
      }

      return {
        ...response,
        payload: tweets
      }
    }
  })

  done()
}
