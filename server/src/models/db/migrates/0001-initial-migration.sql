CREATE TABLE "users" (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  -- BigInt
  twitter_id TEXT NOT NULL CONSTRAINT unique_twitter_id UNIQUE,
  UNIQUE (id)
);

CREATE TABLE "posts" (
  id SERIAL PRIMARY KEY NOT NULL,
  -- // https://developer.twitter.com/en/blog/community/2020/getting-to-the-canonical-url-for-a-tweet
  -- BigInt
  tweet_id TEXT NOT NULL CONSTRAINT unique_tweet_id UNIQUE,
  user_id SERIAL NOT NULL,
  content BYTEA NOT NULL,
  background TEXT NOT NULL,
  exert TEXT NOT NULL,
  is_published BOOLEAN NOT NULL,
  UNIQUE (id),
  CONSTRAINT for_user FOREIGN KEY(user_id) REFERENCES "users"(id)
);
