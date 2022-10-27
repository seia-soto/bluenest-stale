echo "check: postgre"

dropdb test-db
dropuser test-user

createdb test-db
createuser test-user

psql -d test-db -c 'grant all privileges on database "test-db" to "test-user"'

echo "check: atdb schema"

export DATABASE_URL="postgres://test-user@localhost:5432/test-db"

pnpm database:apply
pnpm database:sync

. ./scripts/build.sh
