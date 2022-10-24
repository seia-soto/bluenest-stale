import Client from 'twitter-api-sdk'
import { TwitterParams, usersIdTweets } from 'twitter-api-sdk/dist/types'
import { getCacheFor, setCacheFor } from '../kv'
import { ECacheStatus } from '../types/api'
import { TTwitterRecentTweets } from '../types/twitter'
import * as reform from './reform'

export const TWITTER_QUERY_CACHE_PREFIX = 'qc.twitter'

export const TWITTER_QUERY_CACHE_TTL = parseInt(process.env.CACHE_TWITTER_QUERY_TTL ?? '60000')

export const TWITTER_SHARED_PROPERTIES: TwitterParams<usersIdTweets> = {
  expansions: ['attachments.media_keys', 'author_id'],
  'tweet.fields': ['id', 'text', 'attachments', 'created_at', 'withheld', 'conversation_id'],
  'media.fields': ['url', 'type'],
  'user.fields': ['username', 'name', 'profile_image_url']
}

export const queryRecents = async (accessToken: string, id: string) => {
  const key = `${TWITTER_QUERY_CACHE_PREFIX}.${id}.recents`
  const cache = await getCacheFor<TTwitterRecentTweets>(key, TWITTER_QUERY_CACHE_TTL)

  if (cache) {
    return [ECacheStatus.Hit, cache.data] as const
  }

  const twitter = new Client(accessToken)

  const rawTweets = await twitter.tweets.usersIdTweets(id, {
    max_results: 5,
    exclude: ['retweets', 'replies'],
    ...TWITTER_SHARED_PROPERTIES
  })
  const tweets = reform.tweets(rawTweets)

  await setCacheFor<TTwitterRecentTweets>(key, tweets, TWITTER_QUERY_CACHE_TTL)

  return [ECacheStatus.Miss, tweets] as const
}

export const queryThread = async (accessToken: string, id: string) => {
  const key = `${TWITTER_QUERY_CACHE_PREFIX}.${id}.thread`
  const cache = await getCacheFor<TTwitterRecentTweets>(key, TWITTER_QUERY_CACHE_TTL)

  if (cache) {
    return [ECacheStatus.Hit, cache.data] as const
  }

  const twitter = new Client(accessToken)

  const rawOriginalTweet = await twitter.tweets.findTweetsById({
    ids: [id],
    expansions: ['attachments.media_keys', 'author_id'],
    ...TWITTER_SHARED_PROPERTIES
  })
  const [originalTweet] = reform.tweets(rawOriginalTweet)

  console.log(`from:${originalTweet.user.username} to:${originalTweet.user.username} conversation_id:${originalTweet.rootId}`)

  const rawRepliedTweets = await twitter.tweets.tweetsRecentSearch({
    max_results: 100,
    query: `from:${originalTweet.user.id} to:${originalTweet.user.id} conversation_id:${originalTweet.rootId}`,
    ...TWITTER_SHARED_PROPERTIES
  })

  console.log(JSON.stringify(rawRepliedTweets))

  const repliedTweets = reform.tweets(rawRepliedTweets).filter(tweet => tweet.rootId === originalTweet.id)

  const merged: TTwitterRecentTweets = [originalTweet, ...repliedTweets]

  return [ECacheStatus.Miss, merged] as const
}
