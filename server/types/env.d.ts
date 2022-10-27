declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PRIVILEGED_DOMAIN: string
      ED_PRIVATE: string
      ED_PUBLIC: string
      DATABASE_URL: string
      KEYDB_URL: string
      CONNECT_TWITTER_KEY: string
      CONNECT_TWITTER_SECRET: string
    }
  }
}

export {}
