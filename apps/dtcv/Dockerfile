FROM node:20-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
RUN corepack enable && corepack prepare yarn@1.22.22 --activate 
# Set working directory
WORKDIR /app

RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=dtcv --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

ARG CR_PAT
ENV CR_PAT=$CR_PAT

RUN echo registry=https://registry.npmjs.org/ >> ~/.npmrc
RUN echo @paramountric:registry=https://npm.pkg.github.com/ >> ~/.npmrc
RUN echo //npm.pkg.github.com/:_authToken=$CR_PAT >> ~/.npmrc

WORKDIR /app

RUN yarn global add turbo
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY --from=builder /app/out/package.json ./package.json
RUN yarn install

# Copy the rest of the files
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo db:push db:generate

# Build the app
RUN yarn turbo run build --filter=dtcv...

FROM node:20-alpine AS runner
WORKDIR /app

# this is for the shell script below
RUN apk add --no-cache --upgrade bash

ENV NODE_ENV production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/dtcv/next.config.js ./apps/dtcv/next.config.js
COPY --from=installer /app/apps/dtcv/public ./apps/dtcv/public
COPY --from=installer /app/apps/dtcv/package.json ./apps/dtcv/package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/dtcv/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/dtcv/.next/static ./apps/dtcv/.next/static

COPY --from=builder --chown=nextjs:nodejs /app/apps/dtcv/entrypoint.sh ./apps/dtcv/
COPY --from=builder --chown=nextjs:nodejs /app/apps/dtcv/.env.production ./apps/dtcv/

RUN chmod +x ./apps/dtcv/entrypoint.sh
ENTRYPOINT ["./apps/dtcv/entrypoint.sh"]

CMD node apps/dtcv/server.js