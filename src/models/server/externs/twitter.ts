import { TwitterApi, TwitterApiTokens } from 'twitter-api-v2'

export const OAUTH_CALLBACK = `${process.env.PRIVILEGED_DOMAIN}/api/connect/twitter/complete`

export const createClient = (tokens?: Omit<TwitterApiTokens, 'appKey' | 'appSecret'>) => new TwitterApi({
  ...tokens,
  appKey: process.env.CONNECT_TWITTER_KEY,
  appSecret: process.env.CONNECT_TWITTER_SECRET
})
