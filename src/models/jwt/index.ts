import { createSigner, createVerifier } from 'fast-jwt'
import { readFileSync } from 'fs'

export interface IJwtPayload {
  user: {
    id: string
    name: string
  }
  twitter: {
    accessToken: string
  }
}

export interface IJwtPayloadEncoded extends IJwtPayload {
  iat: number
}

export const iss = 'instance.bnest.seia.io'

const PRIVATE_KEY = readFileSync(process.env.ED_PRIVATE)
const PUBLIC_KEY = readFileSync(process.env.ED_PUBLIC)

export const signer = createSigner({
  key: PRIVATE_KEY,
  algorithm: 'EdDSA',
  mutatePayload: false,
  notBefore: 0,
  expiresIn: 1000 * 60 * 5,
  iss
}) as (_: IJwtPayload) => string

export const verifier = createVerifier({
  key: PUBLIC_KEY,
  algorithms: ['EdDSA'],
  complete: false,
  cache: false,
  allowedIss: iss
}) as (_: string) => IJwtPayloadEncoded
