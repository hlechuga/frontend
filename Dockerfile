FROM node:14 AS builder

WORKDIR /app

COPY . ./

RUN npm install && npm install express process node-fetch

RUN npm run build

FROM gcr.io/distroless/nodejs:14

COPY --from=builder ./app ./app

WORKDIR /app

CMD ["server.js"]