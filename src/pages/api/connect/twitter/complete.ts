import { deleteCookie, setCookie } from 'cookies-next'
import { NextApiRequest, NextApiResponse } from 'next'
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

  const jwt = obtain<IOAuthPayload & IEncodedToken>('a', req)

  if (
    !jwt ||
    jwt.provider !== 'twitter'
  ) {
    return res.redirect('/connect/twitter/error')
  }

  deleteCookie('a', { req, res })

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

    setCookie('b', kJwt, { req, res })

    return res.redirect('/dashboard')
  } catch (error) {
    console.error(error)

    return res.redirect('/connect/twitter/error')
  }
}
