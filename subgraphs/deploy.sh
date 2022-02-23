#!/bin/sh

cd creatify
npm run create:hosted
npm run deploy:hosted
cd -

cd marketplace
npm run create:hosted
npm run deploy:hosted
cd -