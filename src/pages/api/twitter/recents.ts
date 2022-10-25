import { NextApiRequest, NextApiResponse } from 'next'
import { EServerCacheStatus } from '../../../models/api/protocol'
import { TTwitterTimelineResponse } from '../../../models/api/specifications'
import { createClient } from '../../../models/server/externs/twitter'
import { ITokenPayload, obtain } from '../../../models/server/jwt'
import { getCacheFor, setCacheFor } from '../../../models/server/kv'

const SERVER_CACHE_TTL = 1000 * 60 * 2
const CLIENT_CACHE_TTL = 1000 * 30

export default async function handler (req: NextApiRequest, res: NextApiResponse<TTwitterTimelineResponse>) {
  const jwt = obtain<ITokenPayload>('b', req)

  if (!jwt) {
    return res
      .status(403)
      .json({
        meta: {
          cache: {
            client: {
              exp: -1
            },
            server: {
              iat: 0,
              status: EServerCacheStatus.Miss
            }
          }
        }
      })
  }

  const cacheKey = 'twitterv1.timeline.' + jwt.connections.twitter.user.id
  const cache = await getCacheFor<TTwitterTimelineResponse['payload']>(cacheKey)

  res.setHeader('Cache-Control', `max-age=${CLIENT_CACHE_TTL}`)

  if (cache && (cache.iat + SERVER_CACHE_TTL) >= Date.now()) {
    return res
      .status(200)
      .setHeader('Age', Math.floor((Date.now() - cache.iat) / 1000))
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
