declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PRIVILEGED_DOMAIN: string
      ED_PRIVATE: string
      ED_PUBLIC: string
      KEYDB_URL: string
      CONNECT_TWITTER_KEY: string
      CONNECT_TWITTER_SECRET: string
      CONNECT_REQUEST_LIMIT: string
      CACHE_TWITTER_QUERY_TTL: string
    }
  }
}

export {}
