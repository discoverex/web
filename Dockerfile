# 1. 빌드 스테이지
FROM node:20-slim AS build

# pnpm 활성화
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 패키지 설치 최적화
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# 소스 코드 복사 및 빌드
COPY . .
RUN pnpm build

# 2. 실행 스테이지 (Nginx)
FROM nginx:stable-alpine

# 빌드 결과물 복사
COPY --from=build /app/dist /usr/share/nginx/html

# [중요] Nginx 기본 포트를 80에서 9123으로 변경
RUN sed -i 's/80/9123/g' /etc/nginx/conf.d/default.conf

# 컨테이너 외부로 노출할 포트 명시
EXPOSE 9123

CMD ["nginx", "-g", "daemon off;"]