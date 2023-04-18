#!/bin/sh
export script=true
export NETWORK=mainnet
res=$(npm run deploy)

CREATIFY_ADDRESS=$(echo -e "$res" | tail -1)
MARKETPLACE_ADDRESS=$(echo -e "$res" | tail -2 | head -1)
export CREATIFY_ADDRESS
export MARKETPLACE_ADDRESS
echo "Creatify address is"
echo $CREATIFY_ADDRESS

echo "marketplace address is"
echo $MARKETPLACE_ADDRESS

sleep 4
npm run verify

cd subgraph
npm run create:hosted
npm run deploy:hosted
cd -