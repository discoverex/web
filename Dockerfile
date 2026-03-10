# 1. Prune stage
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
# 전역 설치 대신 npx를 사용하여 프로젝트의 turbo 버전을 따르도록 함
WORKDIR /app
COPY . .
ARG APP_NAME
RUN npx turbo prune --scope=${APP_NAME} --docker

# 2. Build stage
FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 빌드 인자 정의
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_SERVER_URL
ARG APP_NAME

# 환경 변수로 전환
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

# pnpm 및 빌드 설정
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 의존성 설치
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# 전체 소스 복사 및 빌드
COPY --from=builder /app/out/full/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm exec turbo build --filter=${APP_NAME}

# 3. Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ARG APP_NAME
ENV APP_NAME=$APP_NAME
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# standalone 빌드 결과물 복사 (Next.js config의 output: 'standalone' 필요)
COPY --from=installer /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public
COPY --from=installer /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=installer /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static

# 실행 명령 (앱 이름에 따른 경로 설정)
ENTRYPOINT ["sh", "-c", "node apps/${APP_NAME}/server.js"]
