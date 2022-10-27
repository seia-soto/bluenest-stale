import { Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler/index.js'
import { createSigner, createVerifier } from 'fast-jwt'
import { readFileSync } from 'fs'
import env from '../../env.js'

export interface IEncodedToken {
  iss: string
  iat: number
  exp: number
}

export const UserPayload = Type.Object({
  user: Type.Object({
    id: Type.Number(),
    name: Type.String(),
    avatar: Type.String()
  }),
  twitter: Type.Object({
    user: Type.Object({
      id: Type.String(),
      username: Type.String()
    }),
    token: Type.Object({
      accessToken: Type.String(),
      accessSecret: Type.String()
    })
  })
})

export const UserPayloadTypeChecker = TypeCompiler.Compile(UserPayload)

export const UserPayloadChecker = (payload: unknown) => UserPayloadTypeChecker.Check(payload)

export type TUserPayload = Static<typeof UserPayload>

export type TEncodedUserPayload = IEncodedToken & TUserPayload

export const OAuthPayload = Type.Object({
  token: Type.String(),
  secret: Type.String()
})

export const OAuthPayloadTypeChecker = TypeCompiler.Compile(OAuthPayload)

export const OAuthPayloadChecker = (payload: unknown) => OAuthPayloadTypeChecker.Check(payload)

export type TOAuthPayload = Static<typeof OAuthPayload>

export type TEncodedOAuthPayload = IEncodedToken & TOAuthPayload

export const iss = 'instance.bnest.seia.io'

const PRIVATE_KEY = readFileSync(env.ED_PRIVATE)
const PUBLIC_KEY = readFileSync(env.ED_PUBLIC)

export const signer = createSigner({
  key: PRIVATE_KEY,
  algorithm: 'EdDSA',
  mutatePayload: false,
  notBefore: 0,
  expiresIn: 1000 * 60 * 60 * 24,
  iss
}) as <T = TUserPayload>(_: T) => string

export const verifier = createVerifier({
  key: PUBLIC_KEY,
  algorithms: ['EdDSA'],
  complete: false,
  cache: false,
  allowedIss: iss
}) as <T = TEncodedUserPayload>(_: string) => T

export const obtain = <T>(key: string, checker: (_: T) => boolean) => {
  if (!key) {
    return false
  }

  try {
    const payload = verifier<T>(key)

    if (!payload || !checker(payload)) {
      return false
    }

    return payload
  } catch (_) {
    return false
  }
}
