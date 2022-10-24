import { NextApiRequest, NextApiResponse } from 'next'
import { IResponse } from '../../../models/types/api'
import { limitAuthorized, limitMethod, limitRate } from '../../../utils/api'

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

  const [isAuthorized] = limitAuthorized(req, res)

  if (!isAuthorized) {
    return res.redirect('/api/connect/request')
  }

  return res.redirect('/dashboard')
}
