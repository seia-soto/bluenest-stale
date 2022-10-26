import { NextApiRequest, NextApiResponse } from 'next'
import { TweetV1 } from 'twitter-api-v2'
import { ECookieNames } from '../../../models/api/cookies'
import { EServerCacheStatus } from '../../../models/api/protocol'
import { TTwitterTimelineResponse } from '../../../models/api/specifications'
import { createClient, getTweetOrCached } from '../../../models/server/externs/twitter'
import { ITokenPayload, obtain } from '../../../models/server/jwt'
import { forbidden, invalid } from '../../../models/server/templates'

const CLIENT_CACHE_TTL = 1000 * 30

export default async function handler (req: NextApiRequest, res: NextApiResponse<TTwitterTimelineResponse>) {
  const jwt = obtain<ITokenPayload>(ECookieNames.general, req)

  if (!jwt) {
    return forbidden(res)
  }

  const { id: kIdentifier } = req.query
  let identifier = kIdentifier.toString()

  if (isNaN(parseInt(identifier))) {
    return invalid(res)
  }

  const { accessToken, accessSecret } = jwt.connections.twitter.token
  const client = createClient({ accessToken, accessSecret })

  try {
    await client.v1.verifyCredentials()
  } catch (_) {
    return forbidden(res)
  }

  const tweets: TweetV1[] = []

  for (; ;) {
    const tweet = await getTweetOrCached(client, identifier)

    if (
      typeof tweet !== 'boolean' &&
      tweet.user.id_str === jwt.connections.twitter.user.id
    ) {
      tweets.push(tweet)
    }

    identifier = tweet.in_reply_to_status_id_str

    if (!identifier) {
      break
    }
  }

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
      payload: tweets.reverse()
    })
}
