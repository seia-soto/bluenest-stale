import Redis from 'ioredis'

export const keydb = new Redis(process.env.KEYDB_URL)

export interface ICache<T> {
  iat: number
  data: T
}

export const getCacheFor = async <T>(key: string) => {
  const value = await keydb.get('c.' + key)

  if (!value) {
    console.log('CACHE MISS key=%s', key)

    return
  }

  console.log('CACHE HIT key=%s', key)

  const cache: ICache<T> = JSON.parse(value)

  return cache
}

export const setCacheFor = async <T>(key: string, value: T, ttl: number = 5 * 60 * 1000) => {
  console.log('CACHE SET key=%s ttl=%d', key, ttl)

  const data = JSON.stringify({
    iat: Date.now(),
    data: value
  })

  const kKey = 'c.' + key

  await keydb.set(kKey, data)
  await keydb.expire(kKey, ttl / 1000)
}
