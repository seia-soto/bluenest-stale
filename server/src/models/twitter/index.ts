import { TweetV1, TwitterApi, TwitterApiTokens, UserV1 } from 'twitter-api-v2'
import env from '../../env.js'
import { getCacheFor, setCacheFor } from '../keydb/index.js'

export const OAUTH_CALLBACK = `${env.PRIVILEGED_DOMAIN}/api/oauth/complete`

export const createClient = (tokens?: Omit<TwitterApiTokens, 'appKey' | 'appSecret'>) => new TwitterApi({
  ...tokens,
  appKey: env.CONNECT_TWITTER_KEY,
  appSecret: env.CONNECT_TWITTER_SECRET
})

export const TWITTER_TWEET_TTL = 1000 * 60 * 60 * 12

export const getTweetOrCached = async (client: TwitterApi, id: string) => {
  const cacheKey = 'twitterv1.tweet.' + id
  const cache = await getCacheFor<TweetV1>(cacheKey)

  if (cache && (cache.iat + TWITTER_TWEET_TTL) >= Date.now()) {
    return cache.data
  }

  const tweet = await client.v1.singleTweet(id, {
    include_entities: true
  })
    .catch(_ => false) as TweetV1

  await setCacheFor(cacheKey, tweet, TWITTER_TWEET_TTL)

  return tweet
}

export const setTweetCache = async (tweet: TweetV1) => {
  const cacheKey = 'twitterv1.tweet.' + tweet.id_str

  await setCacheFor(cacheKey, tweet, TWITTER_TWEET_TTL)
}

export const TWITTER_PROFILE_TTL = 1000 * 60 * 2

export const getProfileOrCached = async (client: TwitterApi, id: string) => {
  const cacheKey = 'twitterv1.profile.' + id
  const cache = await getCacheFor<UserV1>(cacheKey)

  if (cache && (cache.iat + TWITTER_PROFILE_TTL) >= Date.now()) {
    return cache.data
  }

  const tweet = await client.currentUser()
    .catch(_ => false) as UserV1

  await setCacheFor(cacheKey, tweet, TWITTER_PROFILE_TTL)

  return tweet
}
