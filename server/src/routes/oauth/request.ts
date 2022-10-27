import { db, users } from '../../models/db/provider.js'
import { obtain, signer, TEncodedUserPayload, TOAuthPayload, UserPayloadChecker } from '../../models/jwt/index.js'
import { createClient, OAUTH_CALLBACK } from '../../models/twitter/index.js'
import { ECookieName, TFastifyTypedPluginCallback } from '../../types.js'

export const requestHandler: TFastifyTypedPluginCallback = (fastify, _opts, done) => {
  void fastify.route({
    url: '/',
    method: 'GET',
    handler: async (request, reply) => await db.tx(async t => {
      const user = obtain<TEncodedUserPayload>(request.cookies[ECookieName.general] ?? '', UserPayloadChecker)

      if (
        user &&
        await users(t).count({ id: user.user.id }) > 0
      ) {
        const { accessToken, accessSecret } = user.twitter.token

        const isTokenUsible = await createClient({ accessToken, accessSecret }).v1.verifyCredentials()
          .catch(_ => false)

        if (isTokenUsible) {
          return await reply.redirect('/app')
        }
      }

      const auth = await createClient().generateAuthLink(OAUTH_CALLBACK)
        .catch(_ => false as const)

      if (!auth) {
        return await reply.redirect('/auth/error')
      }

      const oauthRequest = signer<TOAuthPayload>({
        token: auth.oauth_token,
        secret: auth.oauth_token_secret
      })

      await reply
        .clearCookie(ECookieName.general)
        .clearCookie(ECookieName.postAuthorization)
        .setCookie(ECookieName.postAuthorization, oauthRequest, {
          path: '/api/oauth',
          sameSite: 'lax',
          httpOnly: true,
          maxAge: 60 * 2
        })
        .redirect(auth.url)
    })
  })

  done()
}

export default requestHandler
