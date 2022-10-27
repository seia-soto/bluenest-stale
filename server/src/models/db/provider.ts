import createConnectionPool, { sql } from '@databases/pg'
import tables from '@databases/pg-typed'
import env from '../../env.js'
import type Schema from './schema/index.js'
import databaseSchema from './schema/schema.json' assert { type: 'json' }

export { sql }

export const db = createConnectionPool(env.DATABASE_URL)

export const {
  users,
  posts
} = tables<Schema>({
  databaseSchema
})
