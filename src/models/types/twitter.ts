export interface ITwitterUser {
  id: string
  username: string
  name: string
  avatar: {
    url: string
  }
}

export interface ITwitterAttachment {
  mediaKey: string
  type: string
  url: string
}

export interface ITwitterTweet {
  id: string
  rootId: string
  text: string
  user: ITwitterUser
  attachments: ITwitterAttachment[]
  createdAt: Date
}

export type TTwitterRecentTweets = ITwitterTweet[]
