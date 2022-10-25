import { deleteCookie } from 'cookies-next'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  deleteCookie('a', { req, res })
  deleteCookie('b', { req, res })

  return res.redirect('/connect/revoke')
}
