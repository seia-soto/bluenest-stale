import { setCookie } from 'cookies-next'
import { nanoid } from 'nanoid'
import { NextApiRequest, NextApiResponse } from 'next'
import Client from 'twitter-api-sdk'
import { complete } from '../../../models/connect/twitter'
import { signer } from '../../../models/jwt'
import { TResponse } from '../../../models/types/api'
import { limitMethod, limitRate } from '../../../utils/api'

export default async function handler (req: NextApiRequest, res: NextApiResponse<TResponse<null>>) {
  const [isValidMethod, replyInvalidMethod] = limitMethod(req, 'GET')

  if (!isValidMethod) {
    return res
      .status(403)
      .json(replyInvalidMethod)
  }

  const [isNotRateLimited] = await limitRate.oauth.complete(req)

  if (!isNotRateLimited) {
    return res.redirect('/connect/limited')
  }

  // Get callback queries
  const { state, code } = req.query as Record<string, string>

  if (
    typeof state !== 'string' ||
    typeof code !== 'string'
  ) {
    return res.redirect('/connect/authorize')
  }

  // Generate access token
  const token = await complete(state, code)

  if (!token.access_token) {
    return res.redirect('/connect/authorize')
  }

  // Get username
  const twitter = new Client(token.access_token)
  const user = await twitter.users.findMyUser({
    'user.fields': ['id', 'username']
  })

  if (!user.data?.username) {
    return res.redirect('/connect/authorize')
  }

  // Sign JWT
  const jwt = signer({
    user: {
      id: user.data.id,
      name: user.data.username
    },
    twitter: {
      accessToken: token.access_token
    }
  })

  setCookie('aa', jwt, {
    req,
    res,
    maxAge: 1000 * 60 * 5, // 5 mins
    secure: false,
    httpOnly: true
  })
  setCookie('ab', nanoid(), {
    req,
    res,
    maxAge: 1000 * 60 * 60 * 4, // 4 hours
    secure: false,
    httpOnly: false
  })

  // Goto dashboard
  return res.redirect('/dashboard')
}
