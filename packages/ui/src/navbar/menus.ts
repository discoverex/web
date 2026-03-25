export interface MenuItem {
  name: string;
  path: string;
  description: string;
  isExternal?: boolean;
}

const HUB_URL =
  process.env.NEXT_PUBLIC_GAME_HUB_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://discoverex-game-hub-329947062450.asia-northeast3.run.app"
    : "http://localhost:3000");

const DISCOVEREX_URL =
  process.env.NEXT_PUBLIC_DISCOVEREX_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://discoverex-discoverex-329947062450.asia-northeast3.run.app"
    : "http://localhost:3001");

const MAGICEYE_URL =
  process.env.NEXT_PUBLIC_MAGIC_EYE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://discoverex-magic-eye-329947062450.asia-northeast3.run.app"
    : "http://localhost:3002");

export const menus: MenuItem[] = [
  {
    name: "Home",
    path: HUB_URL + "/home",
    description: "메인 허브",
    isExternal: true,
  },
  {
    name: "렉스를 찾아라!",
    path: DISCOVEREX_URL,
    description: "숨은그림찾기",
    isExternal: true,
  },
  {
    name: "퀴즈 매직아이",
    path: MAGICEYE_URL,
    description: "매직아이 게임",
    isExternal: true,
  },
];
