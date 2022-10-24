mkdir -p ./keys
openssl genpkey -algorithm ed25519 > ./keys/priv.key
openssl pkey -in ./keys/priv.key -pubout -out /dev/stdout > ./keys/pub.crt