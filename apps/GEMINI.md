# Project Overview: Vision AI GAMES World

This workspace contains the applications for the "Vision AI GAMES World" project, a hub for games utilizing Vision AI. It is structured as a monorepo, with multiple Next.js applications located in the `apps/` directory.

## Architecture & Technologies

- **Monorepo Structure:** Managed via Turborepo (inferred).
- **Frontend Framework:** [Next.js 16.1.5](https://nextjs.org/) (App Router)
- **UI Library:** [React 19.2.0](https://react.dev/)
- **Styling:** [Tailwind CSS 4.2.1](https://tailwindcss.com/) & [DaisyUI 5.5.19](https://daisyui.com/)
- **Theme Management:** [next-themes 0.4.6](https://github.com/pacocoursey/next-themes)
- **Language:** [TypeScript 5.9.2](https://www.typescriptlang.org/)
- **Workspace Packages:**
  - `@repo/ui`: Shared UI components.
  - `@repo/quiz-magic-eye`: Specialized game logic/components.
  - `@repo/eslint-config`: Shared ESLint configurations.
  - `@repo/typescript-config`: Shared TypeScript configurations.

## Applications

### 1. `web` (Main App)
- **Port:** 3000
- **Purpose:** The main hub for Vision AI games.
- **Key Features:**
  - **Home:** Landing page.
  - **렉스를 찾아라! (Find Rex):** Hidden object game.
  - **퀴즈 매직아이 (Quiz Magic Eye):** Magic eye quiz game.
- **Location:** `apps/web`

### 2. `docs` (Documentation)
- **Port:** 3001
- **Purpose:** Project documentation.
- **Location:** `apps/docs`

## Building and Running

Commands should be run from within the respective application directory or from the root (if Turborepo is configured globally).

### Common Scripts (per app)
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run check-types`: Runs TypeScript type checking.

## Development Conventions

### Code Style (Prettier)
- **Print Width:** 120
- **Single Quote:** `true`
- **Trailing Comma:** `all`
- **Semicolons:** `true`
- **Tab Width:** 2

### Linting (ESLint)
- Uses shared configuration from `@repo/eslint-config/next-js`.

### Fonts
- Uses local fonts: `GeistSans` and `GeistMono`.
- Custom fonts like `Pretendard` are available in the `web` app.

### Themes
- Supports Light and Dark modes using `next-themes` and DaisyUI's `data-theme` attribute.
