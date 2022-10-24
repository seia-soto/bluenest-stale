import { deleteCookie } from 'cookies-next'
import { NextApiRequest, NextApiResponse } from 'next'
import { IResponse } from '../../../models/types/api'
import { limitMethod, limitRate } from '../../../utils/api'

export default async function handler (req: NextApiRequest, res: NextApiResponse<IResponse>) {
  const [isValidMethod, replyInvalidMethod] = limitMethod(req, 'GET')

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

  deleteCookie('aa', { req, res })
  deleteCookie('cache-session', { req, res })

  return res.redirect('/connect/revoke')
}
