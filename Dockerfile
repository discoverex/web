# 1. Prune stage
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN npm install -g turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=game-hub --docker

# 2. Build stage
FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 빌드 인자 정의 (GitHub Actions에서 넘겨준 값을 받음)
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_SERVER_URL

# 환경 변수로 전환 (Next.js 빌드 시점에 브라우저용 변수로 포함)
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

# 의존성 설치 (캐싱 활용)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# 전체 소스 복사 및 빌드
COPY --from=builder /app/out/full/ .
# 빌드 시 텔레메트리 비활성화 (권장)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo build --filter=game-hub

# 3. Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# 아래 기본 포트는 외부 주입 PORT로 덮어씌워지게 됨
ENV PORT=8080
# Next.js standalone은 HOSTNAME을 0.0.0.0으로 잡아야 외부에서 접근 가능
ENV HOSTNAME="0.0.0.0"

# standalone 모드에서는 빌드 결과물 폴더 구조가 바뀜
# .next/standalone 폴더 내용물을 루트로 변경
COPY --from=installer /app/apps/web/public ./apps/web/public
COPY --from=installer /app/apps/web/.next/standalone ./
COPY --from=installer /app/apps/web/.next/static ./apps/web/.next/static

# standalone 빌드 결과는 Turborepo 구조에 따라 다를 수 있으니 아래 실행파일 경로 확인
CMD ["node", "apps/web/server.js"]