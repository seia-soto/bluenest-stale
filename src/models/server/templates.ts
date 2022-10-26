import { NextApiResponse } from 'next'
import { EServerCacheStatus, IResponse } from '../api/protocol'

export const empty: () => IResponse = () => ({
  meta: {
    cache: {
      client: {
        exp: -1
      },
      server: {
        iat: 0,
        status: EServerCacheStatus.Miss
      }
    }
  }
})

export const forbidden = (res: NextApiResponse) => {
  return res
    .status(403)
    .json(empty())
}

export const invalid = (res: NextApiResponse) => {
  return res
    .status(404)
    .json(empty())
}
