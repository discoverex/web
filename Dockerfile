# 1. Prune stage
FROM node:20-bookworm-slim AS builder
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
ARG APP_NAME=game-hub
# pnpm dlx를 사용하여 프로젝트의 turbo 버전을 따르도록 함 (더 안정적)
RUN npx turbo prune --scope=${APP_NAME} --docker

# 2. Build stage
FROM node:20-bookworm-slim AS installer
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# pnpm 명시적 활성화 및 버전 설정
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 빌드 인자 재선언 (다음 단계에서 사용)
ARG APP_NAME=game-hub
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_SERVER_URL

# 환경 변수로 전환
ENV APP_NAME=$APP_NAME
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

# 의존성 설치를 위한 설정 복사
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# 전체 소스 복사 및 빌드
COPY --from=builder /app/out/full/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm exec turbo build --filter=${APP_NAME}

# 3. Runner stage
FROM node:20-bookworm-slim AS runner
# 실행 시 필요한 최소한의 공유 라이브러리 설치
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ARG APP_NAME=game-hub
ENV APP_NAME=$APP_NAME
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# standalone 빌드 결과물 복사 (Next.js config의 output: 'standalone' 필요)
COPY --from=installer /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public
COPY --from=installer /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=installer /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static

# pnpm 구조상 node_modules 내부 깊숙이 있는 .so 파일을 시스템이 찾을 수 있게 조치
# standalone 모드에서는 루트의 node_modules에 위치함
ENV LD_LIBRARY_PATH="/app/node_modules/onnxruntime-node/bin/napi-v6/linux/x64:/usr/lib"

# 실행 명령 (앱 이름에 따른 경로 설정)
ENTRYPOINT ["sh", "-c", "node apps/${APP_NAME}/server.js"]
