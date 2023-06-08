FROM node:18-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
RUN corepack enable && corepack prepare pnpm@7.26.2 --activate 
# Set working directory
WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN pnpm add turbo --global
COPY . .
RUN turbo prune --scope=landing --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
RUN corepack enable && corepack prepare pnpm@7.26.2 --activate 

WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run build --filter=landing...

FROM node:18-alpine AS runner
WORKDIR /app

# this is for the shell script below
RUN apk add --no-cache --upgrade bash

ENV NODE_ENV production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/projects/dte-digital-twin-energy/next.config.js ./projects/dte-digital-twin-energy/next.config.js
COPY --from=installer /app/projects/dte-digital-twin-energy/public ./projects/dte-digital-twin-energy/public
COPY --from=installer /app/projects/dte-digital-twin-energy/package.json ./projects/dte-digital-twin-energy/package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/projects/dte-digital-twin-energy/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/projects/dte-digital-twin-energy/.next/static ./projects/dte-digital-twin-energy/.next/static

COPY --from=builder --chown=nextjs:nodejs /app/projects/dte-digital-twin-energy/entrypoint.sh ./projects/dte-digital-twin-energy/
COPY --from=builder --chown=nextjs:nodejs /app/projects/dte-digital-twin-energy/.env.production ./projects/dte-digital-twin-energy/

RUN chmod +x ./projects/dte-digital-twin-energy/entrypoint.sh
ENTRYPOINT ["./projects/dte-digital-twin-energy/entrypoint.sh"]

CMD node projects/dte-digital-twin-energy/server.js