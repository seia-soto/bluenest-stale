import { auth } from 'twitter-api-sdk'
import { nanoid } from 'nanoid'
import { client as kv } from '../kv'

export const createClient = () => new auth.OAuth2User({
  client_id: process.env.CONNECT_TWITTER_KEY,
  client_secret: process.env.CONNECT_TWITTER_SECRET,
  callback: `${process.env.PRIVILEGED_DOMAIN}/api/connect/complete`,
  scopes: ['tweet.read', 'users.read']
})

export const request = async () => {
  const state = nanoid()
  const [authUrl, codeVerifier] = createClient().generateAuthURL({
    state,
    code_challenge_method: 's256'
  })

  await kv.set(state, codeVerifier)

  return authUrl
}

export const complete = async (state: string, code: string) => {
  const codeVerifier = await kv.get(state)

  if (!codeVerifier) {
    return {}
  }

  const { token } = await createClient().requestAccessToken(code, codeVerifier)

  if (!token.access_token) {
    return {}
  }

  return token
}
