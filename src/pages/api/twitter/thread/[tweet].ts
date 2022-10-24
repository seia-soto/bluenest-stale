import { NextApiRequest, NextApiResponse } from 'next'
import { isAuthorizationFailure } from '../../../../models/twitter/error'
import { queryThread } from '../../../../models/twitter/query'
import { CACHE_STATUS_HEADER, EResponseStatus, IResponse, TResponse } from '../../../../models/types/api'
import { TTwitterRecentTweets } from '../../../../models/types/twitter'
import { limitAuthorized, limitMethod, limitRate } from '../../../../utils/api'

export default async function handler (req: NextApiRequest, res: NextApiResponse<TResponse<TTwitterRecentTweets>>) {
  const [isValidMethod, replyInvalidMethod] = limitMethod(req, 'POST')

  if (!isValidMethod) {
    return res
      .status(403)
      .json(replyInvalidMethod)
  }

  const [isNotRateLimited, replyRateLimited] = await limitRate._f(req)

  if (!isNotRateLimited) {
    return res
      .status(403)
      .json(replyRateLimited)
  }

  const [isAuthorized, payload] = limitAuthorized(req, res)

  if (!isAuthorized) {
    return res
      .status(403)
      .json(payload as IResponse<null>)
  }

  const tweetId = req.query?.tweet?.toString()

  if (!tweetId) {
    return res
      .status(404)
      .json({ status: EResponseStatus.Nothing })
  }

  try {
    const [xCacheStatus, data] = await queryThread(payload.twitter.accessToken, tweetId)

    return res
      .status(200)
      .setHeader(CACHE_STATUS_HEADER, xCacheStatus)
      .json({
        status: EResponseStatus.Ok,
        data
      })
  } catch (error) {
    if (isAuthorizationFailure(error)) {
      return res
        .status(200)
        .json({
          status: EResponseStatus.AuthorizationRequired
        })
    }

    console.error(error, JSON.stringify(error, null, 2))

    return res
      .status(500)
      .json({
        status: EResponseStatus.NotOk
      })
  }
}
