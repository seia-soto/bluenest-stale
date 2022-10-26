import { deleteCookie, setCookie } from 'cookies-next'
import { NextApiRequest, NextApiResponse } from 'next'
import { ECookieNames } from '../../../../models/api/cookies'
import { createClient } from '../../../../models/server/externs/twitter'
import { IEncodedToken, IOAuthPayload, obtain, signer } from '../../../../models/server/jwt'

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const { oauth_token: oauthToken, oauth_verifier: oauthVerifier } = req.query

  if (
    typeof oauthToken !== 'string' ||
    typeof oauthVerifier !== 'string'
  ) {
    return res.redirect('/connect/twitter/error')
  }

  const jwt = obtain<IOAuthPayload & IEncodedToken>(ECookieNames.postAuthorization, req)

  if (
    !jwt ||
    jwt.provider !== 'twitter'
  ) {
    return res.redirect('/connect/twitter/error')
  }

  deleteCookie(ECookieNames.postAuthorization, { req, res })

  const client = createClient({
    accessToken: jwt.oauth.token,
    accessSecret: jwt.oauth.secret
  })

  try {
    const { accessToken, accessSecret } = await client.login(oauthVerifier)

    const kClient = createClient({ accessToken, accessSecret })
    const user = await kClient.v1.verifyCredentials()

    const kJwt = signer({
      connections: {
        twitter: {
          user: {
            id: user.id_str,
            username: user.screen_name
          },
          token: {
            accessToken,
            accessSecret
          }
        }
      }
    })

    setCookie(ECookieNames.general, kJwt, { req, res, httpOnly: true, secure: false })

    return res.redirect('/dashboard')
  } catch (error) {
    console.error(error)

    return res.redirect('/connect/twitter/error')
  }
}
