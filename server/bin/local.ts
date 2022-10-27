import { factory } from '../src/index.js'

void (async () => {
  const fastify = await factory()

  const addr = await fastify.listen({
    port: 8000,
    host: '0.0.0.0'
  })

  console.log(addr)
})()
