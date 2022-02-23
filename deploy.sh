#!/bin/sh
export script=true
res=$(npm run deploy:mainnet)

CREATIFY_ADDRESS=$(echo -e "$res" | tail -1)
MARKETPLACE_ADDRESS=$(echo -e "$res" | tail -2 | head -1)
export CREATIFY_ADDRESS
export MARKETPLACE_ADDRESS
echo "Creatify address is"
echo $CREATIFY_ADDRESS

echo "marketplace address is"
echo $MARKETPLACE_ADDRESS

sleep 4
npm run verify:mainnet

cd subgraph
npm run create:hosted
npm run deploy:hosted
cd -