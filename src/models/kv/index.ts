import Redis from 'ioredis'

export const client = new Redis({
  path: process.env.KEYDB_URL,
  enableReadyCheck: true
})

export interface ICache<T> {
  iat: number
  data: T
}

export const getCacheFor = async <T>(key: string, ttl?: number) => {
  const v = await client.get(key)

  if (!v) {
    return false
  }

  const data = JSON.parse(v) as ICache<T>

  if (data.iat + ttl <= Date.now()) {
    await client.del(key)

    return false
  }

  return data
}

export const setCacheFor = async <T>(key: string, value: T, ttl: number = 60 * 1000) => {
  const v = JSON.stringify({ iat: Date.now(), data: value })

  await client.set(key, v)
  await client.expire(key, Math.floor((Date.now() + ttl) / 1000))
}
