import { Static, TSchema, Type } from '@sinclair/typebox'

const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()])

const Undefinedable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Undefined()])

export const TwitterUser = Type.Object({
  id_str: Type.String(),
  name: Type.String(),
  screen_name: Type.String(),
  description: Nullable(Type.String()),
  profile_image_url_https: Type.String()
})

export type TTWitterUser = Static<typeof TwitterUser>

export const TwitterTweet = Type.Partial(
  Type.Object({
    id_str: Type.String(),
    full_text: Undefinedable(Type.String()),
    display_text_range: Type.Array(Type.Number()),
    in_reply_to_status_id_str: Nullable(Type.String()),
    user: TwitterUser
  })
)

export type TTwitterTweet = Static<typeof TwitterTweet>

export const enum EPostFragmentType {
  Text = 0,
  Image,
  Video,
  Code
}

const createPostFragment = <Type extends number, Options extends TSchema>(type: Type, options?: Options) => Type.Object({
  type: Type.Strict(Type.Literal(type)),
  source: Type.String(),
  options: options ?? Type.Null()
})

const PostMediaHeight = Type.Number({
  minimum: 0,
  maximum: 800
})

export const PostTextFragment = createPostFragment(EPostFragmentType.Text, Type.Object({
  isBold: Type.Boolean(),
  isUnderlined: Type.Boolean(),
  isHighlighted: Type.Boolean(),
  headingLevel: Type.Number({
    minimum: 0,
    maximum: 6
  })
}))

export const PostImageFragment = createPostFragment(EPostFragmentType.Image, Type.Object({
  isLandscape: Type.Boolean(),
  height: PostMediaHeight
}))

export const PostVideoFragment = createPostFragment(EPostFragmentType.Video, Type.Object({
  isLandscape: Type.Boolean(),
  height: PostMediaHeight
}))

export const PostCodeFragment = createPostFragment(EPostFragmentType.Code, Type.Object({
  language: Type.String()
}))

export const PostFragment = Type.Union([
  PostTextFragment,
  PostImageFragment,
  PostVideoFragment,
  PostCodeFragment
])

export type TPostFragment = Static<typeof PostFragment>

export const Post = Type.Object({
  id: Type.Number(),
  tweet_id: Type.String(),
  user_id: Type.Number(),
  content: Type.Array(PostFragment),
  background: Type.String(),
  exert: Type.String(),
  is_published: Type.Boolean()
})
