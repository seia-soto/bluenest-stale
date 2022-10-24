import { getCookie } from 'cookies-next'
import { NextApiRequest, NextApiResponse } from 'next'
import { verifier } from '../models/jwt'
import { EResponseStatus, IResponse } from '../models/types/api'
import { client as kv } from '../models/kv'

export const getRemoteAddress = (req: NextApiRequest) => {
  let forwardingHeader = req.headers['x-forwarded-for']

  if (typeof forwardingHeader === 'undefined') {
    return req.socket.remoteAddress
  }

  // If is array
  if (typeof forwardingHeader !== 'string') {
    forwardingHeader = forwardingHeader[0]
  }

  return forwardingHeader.split(',')[0]?.trim() || '_f'
}

export const API_RRL_PREFIX = 'api.rrl'

export const getLimitRate = (
  scope: string = '_f',
  size: number = 60,
  reset: number = 60 * 1000
) => async (req: NextApiRequest) => {
  const ip = getRemoteAddress(req)
  const key = `${API_RRL_PREFIX}.${scope}.${ip}`

  const value = await kv.get(key)

  if (!value) {
    await kv.set(key, [Date.now(), 1].join(','))
    await kv.expire(key, reset)

    return [true, null] as const
  }

  const [from, count] = value.split(',').map(kV => parseInt(kV))

  if (count > size) {
    const reply: IResponse = {
      status: EResponseStatus.Rated
    }

    return [false, reply] as const
  }

  await kv.set(key, [from, count + 1].join(','))
  await kv.expire(key, Math.floor(Date.now() - (from + reset) / 1000))

  return [true, null] as const
}

export const limitRate = {
  _f: getLimitRate(),
  oauth: {
    request: getLimitRate('oa.request', 15),
    complete: getLimitRate('oa.complete', 10)
  }
}

export const limitMethod = (req: NextApiRequest, method: string) => {
  if (req.method !== method) {
    const reply: IResponse = {
      status: EResponseStatus.NotOk
    }

    return [
      false,
      reply
    ] as const
  }

  return [true, null] as const
}

export const limitAuthorized = (req: NextApiRequest, res: NextApiResponse) => {
  const jwt = getCookie('aa', { req, res })?.toString()
  const reply: IResponse = {
    status: EResponseStatus.NotOk
  }

  if (!jwt) {
    return [
      false,
      reply
    ] as const
  }

  try {
    const payload = verifier(jwt)

    return [true, payload] as const
  } catch (_) {
    return [false, reply] as const
  }
}
