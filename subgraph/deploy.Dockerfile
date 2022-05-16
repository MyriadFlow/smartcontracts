#Docker file which deploys the graph on the hosted node

FROM node:14-alpine

WORKDIR /app
COPY package.json .
COPY yarn.lock .

RUN apk add git && yarn --frozen-lockfile && apk del git
COPY . .
CMD yarn create:hosted && yarn deploy:hosted 