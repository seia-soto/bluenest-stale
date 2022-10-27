import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import router from './routes/index.js'

export const factory = async () => {
  const fastify = Fastify()
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler)

  await fastify.register(fastifyCookie)
  await fastify.register(router, { prefix: '/api' })
  await fastify.ready()

  return fastify
}
