import { setCookie } from 'cookies-next'
import { NextApiRequest, NextApiResponse } from 'next'
import { signer } from '../../../models/jwt'
import { EResponseStatus, IResponse } from '../../../models/types/api'
import { limitAuthorized, limitMethod, limitRate } from '../../../utils/api'

export default async function handler (req: NextApiRequest, res: NextApiResponse<IResponse<null>>) {
  const [isValidMethod, reply] = limitMethod(req, 'POST')

  if (!isValidMethod) {
    return res
      .status(403)
      .json(reply)
  }

  const [isNotRateLimited, replyRateLimited] = await limitRate._f(req)

  if (!isNotRateLimited) {
    return res
      .status(403)
      .json(replyRateLimited)
  }

  const [isAuthorized, payload] = limitAuthorized(req, res)

  if (!isAuthorized) {
    return res.redirect('/api/connect/request')
  }

  // Only refresh the token after 2 mins
  if (payload.iat * 1000 + 1000 * 60 * 2 <= Date.now()) {
    return res
      .status(200)
      .json({
        status: EResponseStatus.Nothing
      })
  }

  const kJwt = signer(payload)

  setCookie('aa', kJwt, {
    req,
    res,
    maxAge: 1000 * 60 * 5, // 5 mins
    secure: false,
    httpOnly: true
  })

  // Goto dashboard
  return res
    .status(200)
    .json({
      status: EResponseStatus.Ok
    })
}
