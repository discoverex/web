# 1. Prune stage
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo
WORKDIR /app
COPY . .
# 'web' 앱만 추출
RUN turbo prune --scope=web --out=full

# 2. Build stage
FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable && pnpm install

COPY --from=builder /app/out/full/ .
RUN pnpm turbo build --filter=web

# 3. Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
# 배포 시 외부(GCP)에서 주입하는 PORT가 아래 기본 포트 8080을 덮어씀
ENV PORT 8080
ENV NODE_ENV production

COPY --from=installer /app/apps/web/next.config.js .
COPY --from=installer /app/apps/web/package.json .
COPY --from=installer /app/apps/web/.next ./.next
COPY --from=installer /app/apps/web/public ./public
COPY --from=installer /app/node_modules ./node_modules

CMD ["node", "apps/web/server.js"]