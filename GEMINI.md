# Vision AI GAMES World 프로젝트 개요

이 워크스페이스는 Vision AI를 활용한 게임 허브인 "Vision AI GAMES World" 프로젝트의 저장소입니다. Turborepo를 사용한 모노레포 구조로 관리되며, `apps/` 디렉토리에 여러 Next.js 애플리케이션이 포함되어 있습니다.

## 📂 프로젝트 구조

```text
.
├── apps/
│   ├── game-hub/          # 메인 허브 앱 (포트: 3000)
│   │                      # 타 게임 앱(discoverex, magic-eye 등)으로의 안내 및 진입점 역할
│   ├── discoverex/        # 렉스를 찾아라! (포트: 3001)
│   └── magic-eye/         # 퀴즈 매직아이 (포트: 3002)
├── packages/
│   ├── ui/                # 공용 UI 컴포넌트 라이브러리
│   ├── eslint-config/     # 공유 ESLint 설정
│   └── typescript-config/ # 공유 TypeScript 설정
├── package.json           # 루트 설정
├── turbo.json             # Turborepo 설정
└── pnpm-workspace.yaml    # pnpm 워크스페이스 설정
```

## 🛠 주요 기술 스택

- **프레임워크:** [Next.js 16.1.5+](https://nextjs.org/) (App Router)
- **라이브러리:** [React 19.2.0+](https://react.dev/)
- **스타일링:** [Tailwind CSS 4.2.1+](https://tailwindcss.com/) & [DaisyUI 5.5.19+](https://daisyui.com/)
- **테마 관리:** [next-themes 0.4.6](https://github.com/pacocoursey/next-themes)
- **언어:** [TypeScript 5.9.2](https://www.typescriptlang.org/)
- **패키지 매니저:** pnpm

## 🚀 개발 계획 및 가이드라인

- **앱 역할 정의:** `apps/game-hub`는 모든 게임 앱을 안내하는 중앙 플랫폼이며, `discoverex`나 `magic-eye`와 같은 게임들이 개별 앱으로 추가됩니다.
- **스타일링 원칙:** 주로 **Tailwind CSS**와 **DaisyUI**를 사용하여 UI를 구현합니다.
- **공통 컴포넌트:** 가능한 경우 `packages/ui`의 공용 컴포넌트를 활용하거나 추가하여 재사용성을 높입니다.

### 📁 Next.js App Router 개발 가이드

프로젝트의 `app/` 디렉토리 하위에는 다음과 같은 역할을 수행하는 폴더들이 존재할 수 있습니다. 각 폴더는 특정 역할을 담당하며, **라우팅(View) 역할을 맡지 않는 폴더에는 `page.tsx`를 두지 않습니다.**

- **`api/`**: `route.ts` 파일(Route Handlers)을 포함하며, 서버 사이드 API 로직이나 외부 서비스 연동을 처리합니다.
- **`components/`**: 페이지를 구성하는 React 컴포넌트들이 위치합니다.
  - **Container-View 패턴**: 로직을 담당하는 컴포넌트는 `-container` 접미사를 붙이고, UI 렌더링만 담당하는 컴포넌트는 `-view` 접미사를 붙여 구분합니다.
  - **`components/views/`**: 모든 `-view` 컴포넌트들은 이 폴더 안에 배치하여 순수 UI 컴포넌트임을 명시합니다.
- **`hooks/`**: 상태 관리, 이벤트 리스너, 데이터 페칭 등 컴포넌트 간에 재사용 가능한 React 커스텀 훅(`use...`)을 정의합니다.
- **`types/`**: TypeScript 인터페이스(`interface`), 타입(`type`), 열거형(`enum`) 등 데이터 구조 정의를 포함합니다.
- **`utils/`**: 순수 함수, 헬퍼 함수, 비즈니스 로직 중 컴포넌트와 분리 가능한 재사용 로직을 포함합니다.
- **`consts/`**: 전역 상수, 설정값, 고정된 레이블 데이터 등을 정의합니다.
- **`services/`**: 외부 API 호출이나 특정 라이브러리(예: ONNX, Storage) 연동을 위한 전용 클라이언트를 정의합니다.

### 🖼 이미지 최적화 가이드

- **`next/image` 권장**
  - 표준 `img` 태그 대신 Next.js의 `Image` 컴포넌트를 사용하여 이미지 최적화(크기 조정, 지연 로딩 등)를 적용합니다.
  - 외부 이미지 소스(GCS 등)를 사용하는 경우, **`crossOrigin="anonymous"`** 속성을 명시적으로 추가해야 합니다.
    - **이유:** `apps/magic-eye/next.config.ts`의 COEP(Cross-Origin-Embedder-Policy) 설정이 `credentialless`로 되어 있어, 브라우저의 보안 정책상 외부 리소스를 Canvas 등에 그리거나 추론 모델에서 활용할 때 CORS 인증이 필요하기 때문입니다.
- **필수 속성**: `width`, `height`를 명시하거나, 부모 요소가 `relative`일 경우 `fill` 속성과 `object-fit`을 적절히 활용합니다.

---

## 🤖 Gemini 협업 및 응답 규칙

- **언어 설정:** 제미나이(AI)와의 모든 대화 및 제미나이의 모든 응답은 **한국어**로 진행합니다.
- **코드 가이드:**
  - 기술 스택 및 스타일
    - 제미나이는 코드를 제안할 때 본 프로젝트의 기술 스택(Tailwind CSS, DaisyUI 등)을 반영해야 하며, 기존 코드의 스타일과 명명 규칙을 준수해야 합니다.
    - 논리 제어: 복잡하지 않은 간단한 조건식은 가독성을 위해 if-else 문 대신 '**삼항 연산자(condition ? true : false)**'를 우선적으로 사용합니다.
  - Import 규칙
    - tsconfig.json에 정의된 Path Alias를 우선 사용합니다.
    - 상대 경로(../../) 대신 @/로 시작하는 절대 경로 형식을 사용합니다.
    - 특히 apps/magic-eye 등 모노레포 내 패키지 간 참조 시 명명 규칙을 준수합니다.
- **수행 원칙:** 모든 변경 사항은 구현 후 빌드 및 타입 체크를 통해 검증되어야 합니다.
