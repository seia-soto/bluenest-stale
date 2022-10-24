import { NextApiRequest, NextApiResponse } from 'next'
import { request } from '../../../models/connect/twitter'
import { IResponse } from '../../../models/types/api'
import { limitMethod, limitRate } from '../../../utils/api'

export default async function handler (req: NextApiRequest, res: NextApiResponse<IResponse>) {
  const [isValidMethod, replyInvalidMethod] = limitMethod(req, 'GET')

  if (!isValidMethod) {
    return res
      .status(403)
      .json(replyInvalidMethod)
  }

  const [isNotRateLimited, replyRateLimited] = await limitRate.oauth.request(req)

  if (!isNotRateLimited) {
    return res
      .status(403)
      .json(replyRateLimited)
  }

  const url = await request()

  return res.redirect(url)
}
