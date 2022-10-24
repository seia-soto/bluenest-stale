import { TwitterResponse, usersIdTweets } from 'twitter-api-sdk/dist/types'
import { ITwitterAttachment, ITwitterTweet, ITwitterUser } from '../types/twitter'

export const tweets = (payload: TwitterResponse<usersIdTweets>) => {
  const medias = new Map<string, ITwitterAttachment>()

  payload?.includes?.media?.forEach(media => medias.set(media.media_key, {
    mediaKey: media.media_key,
    type: media.type,
    // @ts-expect-error
    url: media.url
  }))

  const users = new Map<string, ITwitterUser>()

  payload?.includes?.users?.forEach(user => users.set(user.id, ({
    id: user.id,
    username: user.username,
    name: user.name,
    avatar: {
      url: user.profile_image_url
    }
  })))

  const result: ITwitterTweet[] = payload?.data?.map(tweet => ({
    id: tweet.id,
    rootId: tweet.conversation_id,
    text: tweet.text,
    user: users.get(tweet.author_id),
    attachments: tweet?.attachments?.media_keys.map(media => medias.get(media)) ?? [],
    createdAt: new Date(tweet.created_at)
  }))

  return result ?? []
}
