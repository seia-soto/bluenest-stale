import { Type } from '@sinclair/typebox'
import { db, users } from '../../models/db/provider.js'
import { OAuthPayloadChecker, obtain, signer, TEncodedOAuthPayload } from '../../models/jwt/index.js'
import { createClient, getProfileOrCached } from '../../models/twitter/index.js'
import { ECookieName, TFastifyTypedPluginCallback } from '../../types.js'

export const completeHandler: TFastifyTypedPluginCallback = (fastify, opts, done) => {
  void fastify.route({
    url: '/',
    method: 'GET',
    schema: {
      querystring: Type.Object({
        oauth_token: Type.String(),
        oauth_verifier: Type.String()
      })
    },
    handler: async (request, reply) => {
      const { oauth_verifier: oauthVerifier } = request.query
      const oauth = obtain<TEncodedOAuthPayload>(request.cookies[ECookieName.postAuthorization] ?? '', OAuthPayloadChecker)

      if (!oauth) {
        void reply.redirect('/auth/error')

        return
      }

      void reply.clearCookie(ECookieName.postAuthorization)

      const client = createClient({ accessToken: oauth.token, accessSecret: oauth.secret })
      const result = await client.login(oauthVerifier)
        .catch(_ => false as const)

      if (!result) {
        void reply.redirect('/auth/error')

        return
      }

      return await db.tx(async t => {
        let one = await users(t).findOne({ twitter_id: result.userId })

        if (!one) {
          const profile = await getProfileOrCached(result.client, result.userId)
          const [inserted] = await users(t).insert({
            name: profile.name,
            avatar: profile.profile_image_url_https,
            twitter_id: result.userId
          })

          one = inserted
        }

        void reply
          .setCookie(ECookieName.general, signer({
            user: {
              id: one.id,
              name: one.name,
              avatar: one.avatar
            },
            twitter: {
              user: {
                id: result.userId,
                username: result.screenName
              },
              token: {
                accessToken: result.accessToken,
                accessSecret: result.accessSecret
              }
            }
          }), {
            path: '/api',
            sameSite: 'strict',
            httpOnly: true,
            maxAge: 60 * 60 * 24
          })
          .redirect('/app')
      })
    }
  })

  done()
}

export default completeHandler
