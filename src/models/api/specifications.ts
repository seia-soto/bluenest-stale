import { TweetV1, TweetV1TimelineResult } from 'twitter-api-v2'
import { IResponseWithData } from './protocol'

export type TTwitterTimelineResponse = IResponseWithData<TweetV1TimelineResult>

export type TTwitterThreadResponse = IResponseWithData<TweetV1[]>
