import { setCookie } from 'cookies-next'
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient, OAUTH_CALLBACK } from '../../../../models/server/externs/twitter'
import { IEncodedToken, IOAuthPayload, ITokenPayload, obtain, signer } from '../../../../models/server/jwt'

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const kJwt = obtain<ITokenPayload & IEncodedToken>('b', req)

  if (kJwt) {
    const { accessToken, accessSecret } = kJwt.connections.twitter.token

    try {
      await createClient({ accessToken, accessSecret }).v1.verifyCredentials()

      return res.redirect('/dashboard')
    } catch (_) {}
  }

  const client = createClient()

  const auth = await client.generateAuthLink(OAUTH_CALLBACK)

  const jwt = signer<IOAuthPayload>({
    provider: 'twitter',
    oauth: {
      token: auth.oauth_token,
      secret: auth.oauth_token_secret
    }
  })

  setCookie('a', jwt, { req, res })

  res.redirect(auth.url)
}
