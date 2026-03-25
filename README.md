# 🦖 Vision AI GAMES World

Vision AI 기술을 활용한 혁신적인 웹 게임 허브 프로젝트입니다. Turborepo 기반의 모노레포 구조로 설계되었으며, Next.js와 다양한 AI 엔진을 결합하여 고도의 사용자 경험을 제공합니다.

## 📂 프로젝트 구조

```text
.
├── apps/
│   ├── game-hub/          # [Port: 3000] 중앙 플랫폼 및 게임 진입점 (Auth Gateway)
│   ├── discoverex/        # [Port: 3001] 렉스를 찾아라! (Vision AI 기반 숨은그림찾기 - 개발 중)
│   └── magic-eye/         # [Port: 3002] 퀴즈 매직아이 (ONNX AI 기반 이미지 분석 게임)
├── packages/
│   ├── ui/                # 공용 UI 컴포넌트, AuthContext, Firebase 설정 및 테마 관리
│   ├── eslint-config/     # 모노레포 공용 ESLint 설정
│   └── typescript-config/ # 모노레포 공용 TypeScript 설정
├── DOCS/                  # 주요 디버깅 이력 및 기술 문서
├── GEMINI.md              # AI 협업 가이드 및 코드 작성 원칙
├── turbo.json             # Turborepo 빌드/실행 설정
└── pnpm-workspace.yaml    # pnpm 워크스페이스 정의
```

## 🚀 주요 앱 및 서비스

### 1. Game Hub (`apps/game-hub`)
- **역할**: 모든 게임 앱의 중앙 컨트롤 타워 및 인증 게이트웨이입니다.
- **특징**: 사용자는 여기서 로그인하며, 다른 게임으로 이동할 때는 Firebase 또는 `sso_token` 부트스트랩을 통해 각 앱이 자기 기준으로 세션을 다시 동기화합니다.

### 2. Magic Eye (`apps/magic-eye`)
- **역할**: 매직아이 이미지 속에 숨겨진 물체를 AI가 분석하여 힌트를 주는 퀴즈 게임입니다.
- **기술적 특징**:
    - **Server-side AI Inference**: `onnxruntime-node`를 사용하여 서버(Cloud Run)에서 직접 AI 모델(`.onnx`)을 구동합니다.
    - **Container-View 패턴**: 로직과 UI를 완벽히 분리하여 높은 유지보수성을 확보했습니다.
    - **Image Optimization**: Next.js의 `Image` 컴포넌트를 사용하여 GCS(Google Cloud Storage)의 대용량 이미지를 최적화하여 렌더링합니다.

### 3. Discoverex (`apps/discoverex`)
- **역할**: 실시간 비전 기술을 활용한 차세대 숨은그림찾기 게임입니다. (현재 아키텍처 설계 및 개발 진행 중)

## 🛠 핵심 기술 스택 및 아키텍처

### 🔐 인증 상태 공유 (Shared Authentication)
- **메커니즘**: `packages/ui` 내부에 공통으로 정의된 `AuthContext`와 Firebase SDK를 사용합니다.
- **상태 유지**: 운영 환경에서는 공유 쿠키를 전제로 하지 않습니다. 각 앱은 첫 진입 시 현재 토큰으로 `/auth/users/me` 를 다시 호출해 사용자 매핑과 세션 상태를 동기화합니다.
- **SSR 주의사항**: 로컬 개발에서는 `access_token` 쿠키 기반 SSR 보조 경로를 쓸 수 있지만, Cloud Run `run.app` 다중 서비스 운영에서는 SSR 쿠키 공유를 신뢰하지 않습니다.

### 🤖 AI 분석 엔진
- **ONNX Runtime**: PyTorch 등에서 학습된 모델을 웹 서버 환경에서 고속으로 추론합니다.
- **Dynamic Model Loading**: Google Cloud Storage에서 실시간으로 모델 파일을 다운로드하여 메모리에 캐싱하는 동적 로딩 아키텍처를 채택했습니다.

### 🎨 디자인 시스템
- **Tailwind CSS & DaisyUI**: 일관된 테마와 컴포넌트 스타일을 유지합니다.
- **Theme Provider**: 다크 모드와 라이트 모드를 전역적으로 관리하며, 모든 앱에 동일한 사용자 경험을 제공합니다.

## 📦 시작하기 (Development)

이 프로젝트는 `pnpm`을 패키지 매니저로 사용하며, 효율적인 개발 경험을 위해 최적화된 스크립트를 제공합니다.

```bash
# 의존성 설치
pnpm install

# 전체 앱 개발 모드로 실행
pnpm dev

# 특정 앱만 선택하여 실행 (권장)
pnpm dev:game        # game-hub (Port: 3000)
pnpm dev:discoverex  # discoverex (Port: 3001)
pnpm dev:magiceye    # magic-eye  (Port: 3002)
```

### 💎 개발 로그 최적화 (`--ui=stream`)
모든 개발 스크립트에는 Turborepo의 `--ui=stream` 옵션이 적용되어 있습니다. 이를 통해 다음과 같은 장점을 얻을 수 있습니다:
- **깔끔한 로그 출력**: 터미널에 불필요한 레이아웃이나 복잡한 UI 요소 없이 순수한 로그만 스트림 형태로 출력됩니다.
- **혼선 방지**: Turborepo가 자동으로 생성하는 `localhost:3000aeklhewuhr`와 같은 무작위 링크 로그 노출을 차단하여 개발 중인 실제 앱의 URL에만 집중할 수 있도록 돕습니다.
- **디버깅 편의성**: 여러 앱을 동시에 실행하더라도 각 앱의 로그가 섞이지 않고 명확하게 구분되어 출력됩니다.

## 🏗 배포 (Deployment)

- **CI/CD (선택적 배포)**: GitHub Actions를 통해 자동화된 배포 파이프라인이 구축되어 있습니다. 
    - **App Filtering**: 코드 변경이 발생한 특정 앱(또는 공통 패키지)만 감지하여 해당 앱만 배포하는 효율적인 전략을 사용합니다. (`dorny/paths-filter` 활용)
    - **Manual Trigger**: 필요시 `workflow_dispatch`를 통해 특정 앱만 강제로 배포하거나 전체 앱을 배포할 수 있는 수동 실행 옵션을 제공합니다.
- **Infra**: Google Cloud Run을 사용하여 서버리스 컨테이너 환경에서 각 앱이 독립적으로 배포됩니다.
- **Storage**: AI 모델 및 게임 에셋은 Google Cloud Storage를 통해 관리됩니다.

## 📝 개발 가이드라인

효율적인 협업과 일관된 코드 품질을 위해 `GEMINI.md` 파일에 정의된 규칙을 반드시 준수합니다.
- **Naming**: 컨테이너(`-container`), 뷰(`-view`), 훅(`use...`) 등 명명 규칙 준수.
- **Standards**: `next/image` 사용 권장 및 `standalone` 빌드 대응 로직 적용.

---
**Vision AI GAMES World**는 기술의 경계를 허물고 사용자에게 새로운 즐거움을 주는 것을 목표로 합니다.
