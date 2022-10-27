echo "check: pwd"

if [[ ! -f "./server.package" ]]; then
  echo "failed: checking the server.package lock file"
  exit 1
fi

echo "check: compile"

rm -rf ./out
pnpm tsc

if [[ ! -d "./out" ]]; then
  echo "failed: checking the build directory"
  exit 1
fi

echo "check: private key"

mkdir -p ./out/keys

if [[ ! -f "./out/keys/priv.key" ]]; then
  openssl genpkey -algorithm ed25519 > ./out/keys/priv.key
fi

echo "check: public key"

if [[ ! -f "./out/keys/pub.crt" ]]; then
  openssl pkey -in ./out/keys/priv.key -pubout -out /dev/stdout > ./out/keys/pub.crt
fi

echo "check: env"

if [[ ! -f "./out/.env" ]]; then
  cp ./.env ./out/.env
fi
