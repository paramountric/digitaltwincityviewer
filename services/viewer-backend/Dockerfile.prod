FROM node:16-alpine3.14 AS builder
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Create a new image
FROM node:16-alpine3.14
WORKDIR /usr/src/app

# Install production
ENV NODE_ENV=production
COPY package.json ./
# package-lock is needed for npm ci
COPY package-lock.json ./
RUN npm ci --production

RUN mkdir -p /dist
COPY --from=builder /usr/src/app/dist ./dist

CMD npm start