import { NextApiRequest, NextApiResponse } from 'next'
import { TweetV1 } from 'twitter-api-v2'
import { ECookieNames } from '../../../models/api/cookies'
import { EServerCacheStatus } from '../../../models/api/protocol'
import { TTwitterTimelineResponse } from '../../../models/api/specifications'
import { createClient, setTweetCache } from '../../../models/server/externs/twitter'
import { ITokenPayload, obtain } from '../../../models/server/jwt'
import { getCacheFor, setCacheFor } from '../../../models/server/kv'
import { forbidden } from '../../../models/server/templates'

const SERVER_CACHE_TTL = 1000 * 60 * 2
const CLIENT_CACHE_TTL = 1000 * 30

export default async function handler (req: NextApiRequest, res: NextApiResponse<TTwitterTimelineResponse>) {
  const jwt = obtain<ITokenPayload>(ECookieNames.general, req)

  if (!jwt) {
    return forbidden(res)
  }

  const cacheKey = 'twitterv1.timeline.' + jwt.connections.twitter.user.id
  const cache = await getCacheFor<TTwitterTimelineResponse['payload']>(cacheKey)

  if (cache && (cache.iat + SERVER_CACHE_TTL) >= Date.now()) {
    return res
      .status(200)
      .json({
        meta: {
          cache: {
            client: {
              exp: CLIENT_CACHE_TTL
            },
            server: {
              iat: cache.iat,
              status: EServerCacheStatus.Hit
            }
          }
        },
        payload: cache.data
      })
  }

  const { accessToken, accessSecret } = jwt.connections.twitter.token
  const client = createClient({ accessToken, accessSecret })

  const { tweets } = await client.v1.userTimeline(jwt.connections.twitter.user.id, {
    count: 5,
    exclude_replies: true,
    include_entities: true,
    include_rts: false
  })
    .catch(_ => {
      res.status(403)

      return {
        tweets: [] as never[]
      }
    })

  await Promise.all(tweets.map(async (tweet: TweetV1) => await setTweetCache(tweet)))
  await setCacheFor(cacheKey, tweets, SERVER_CACHE_TTL)

  return res
    .json({
      meta: {
        cache: {
          client: {
            exp: CLIENT_CACHE_TTL
          },
          server: {
            iat: -1,
            status: EServerCacheStatus.Miss
          }
        }
      },
      payload: tweets
    })
}
