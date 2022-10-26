import { deleteCookie, getCookie, setCookie } from 'cookies-next'
import { NextApiRequest, NextApiResponse } from 'next'
import { ECookieNames } from '../../../../models/api/cookies'
import { createClient, OAUTH_CALLBACK } from '../../../../models/server/externs/twitter'
import { IEncodedToken, IOAuthPayload, ITokenPayload, obtain, signer } from '../../../../models/server/jwt'

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const kJwt = obtain<ITokenPayload & IEncodedToken>(ECookieNames.general, req)

  if (kJwt) {
    const { accessToken, accessSecret } = kJwt.connections.twitter.token

    try {
      await createClient({ accessToken, accessSecret }).v1.verifyCredentials()

      deleteCookie(ECookieNames.preAuthorization, { req, res })

      return res.redirect('/dashboard')
    } catch (_) {}
  }

  if (getCookie(ECookieNames.preAuthorization, { req, res })?.toString() !== '1') {
    return res.redirect('/connect/authorize')
  }

  deleteCookie(ECookieNames.preAuthorization, { req, res })

  const client = createClient()

  const auth = await client.generateAuthLink(OAUTH_CALLBACK)

  const jwt = signer<IOAuthPayload>({
    provider: 'twitter',
    oauth: {
      token: auth.oauth_token,
      secret: auth.oauth_token_secret
    }
  })

  setCookie(ECookieNames.postAuthorization, jwt, { req, res, httpOnly: true, secure: false })

  res.redirect(auth.url)
}
