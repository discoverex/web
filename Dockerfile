# 1. 빌드 스테이지
FROM node:20-slim AS build

# pnpm 활성화
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 모노레포 전체의 설정 파일 복사 (의존성 캐시용)
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
# 각 패키지의 package.json들도 복사해야 합니다
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/ 

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 전체 소스 복사 및 web 앱 빌드
COPY . .
RUN pnpm --filter web build

# 2. 실행 스테이지 (Nginx)
FROM nginx:stable-alpine

# 빌드 결과물 위치 확인: 보통 apps/web/dist에 생성됩니다
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

# 포트 설정 (9123)
RUN sed -i 's/80/9123/g' /etc/nginx/conf.d/default.conf

EXPOSE 9123

CMD ["nginx", "-g", "daemon off;"]