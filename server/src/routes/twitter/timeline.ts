import { Type } from '@sinclair/typebox'
import { TweetV1 } from 'twitter-api-v2'
import { EServerCacheStatus } from '../../../protocol/definitions.js'
import { Empty, ResponseWithData } from '../../../protocol/generators.js'
import { TwitterTweet } from '../../../protocol/schemas.js'
import { getCacheFor, setCacheFor } from '../../models/keydb/index.js'
import { createClient, setTweetCache } from '../../models/twitter/index.js'
import { TFastifyTypedPluginCallback } from '../../types.js'

const SERVER_CACHE_TTL = 1000 * 60 * 2
const CLIENT_CACHE_TTL = 1000 * 30

export const timelineHandler: TFastifyTypedPluginCallback = (fastify, _opts, done) => {
  fastify.route({
    url: '/',
    method: 'GET',
    schema: {
      response: {
        200: ResponseWithData(Type.Array(TwitterTweet))
      }
    },
    handler: async (request, _reply) => {
      const response = Empty()

      response.meta.cache.client.exp = CLIENT_CACHE_TTL

      const { twitter } = request.session

      const key = 'twitterv1.timeline.' + twitter.user.id
      const cache = await getCacheFor<TweetV1[]>(key)

      if (cache && (cache.iat + SERVER_CACHE_TTL) >= Date.now()) {
        response.meta.cache.client.exp = CLIENT_CACHE_TTL
        response.meta.cache.server.iat = cache.iat
        response.meta.cache.server.status = EServerCacheStatus.Hit

        return {
          ...response,
          payload: cache.data
        }
      }

      const { accessToken, accessSecret } = twitter.token
      const result = await createClient({ accessToken, accessSecret })
        .v1.userTimeline(twitter.user.id, {
          count: 5,
          exclude_replies: true,
          include_entities: true,
          include_rts: false
        })
        .catch(_ => {
          response.meta.cache.server.status = EServerCacheStatus.Stale

          return { tweets: cache?.data }
        })

      const { tweets = [] } = result

      await Promise.all(tweets.map(async tweet => await setTweetCache(tweet)))
      await setCacheFor(key, tweets, SERVER_CACHE_TTL)

      return {
        ...response,
        payload: tweets
      }
    }
  })

  done()
}
