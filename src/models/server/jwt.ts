import { getCookie } from 'cookies-next'
import { createSigner, createVerifier } from 'fast-jwt'
import { readFileSync } from 'fs'
import { NextApiRequest } from 'next'

export interface IEncodedToken {
  iat: number
}

export interface ITokenPayload {
  connections: {
    twitter: {
      user: {
        id: string
        username: string
      }
      token: {
        accessToken: string
        accessSecret: string
      }
    }
  }
}

export interface IOAuthPayload {
  provider: string
  oauth: {
    token: string
    secret: string
  }
}

export const iss = 'instance.bnest.seia.io'

const PRIVATE_KEY = readFileSync(process.env.ED_PRIVATE)
const PUBLIC_KEY = readFileSync(process.env.ED_PUBLIC)

export const signer = createSigner({
  key: PRIVATE_KEY,
  algorithm: 'EdDSA',
  mutatePayload: false,
  notBefore: 0,
  expiresIn: 1000 * 60 * 60 * 24,
  iss
}) as <T = ITokenPayload>(_: T) => string

export const verifier = createVerifier({
  key: PUBLIC_KEY,
  algorithms: ['EdDSA'],
  complete: false,
  cache: false,
  allowedIss: iss
}) as <T = ITokenPayload & IEncodedToken>(_: string) => T

export const obtain = <T>(key: string, req: NextApiRequest) => {
  const cookie = getCookie(key, { req })?.toString()

  if (!cookie) {
    return false
  }

  try {
    return verifier<T>(cookie)
  } catch (error) {
    console.error(error)

    return false
  }
}
