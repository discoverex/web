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

---

## 🤖 Gemini 협업 및 응답 규칙

- **언어 설정:** 제미나이(AI)와의 모든 대화 및 제미나이의 모든 응답은 **한국어**로 진행합니다.
- **코드 가이드:** 제미나이는 코드를 제안할 때 본 프로젝트의 기술 스택(Tailwind CSS, DaisyUI 등)을 반영해야 하며, 기존 코드의 스타일과 명명 규칙을 준수해야 합니다.
- **수행 원칙:** 모든 변경 사항은 구현 후 빌드 및 타입 체크를 통해 검증되어야 합니다.
