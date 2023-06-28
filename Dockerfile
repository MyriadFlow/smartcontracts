FROM golang:alpine3.18 AS goBuilder
WORKDIR /app
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY main.go .
RUN go build -o smartcontracts .


FROM node:lts-slim
WORKDIR /usr/src/app
COPY --from=goBuilder /app/smartcontracts .
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "./smartcontracts" ]