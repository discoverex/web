const DEFAULT_HUB_URL =
  process.env.NODE_ENV === "production"
    ? "https://discoverex-game-hub-329947062450.asia-northeast3.run.app"
    : "http://localhost:3000";

export const HUB_URL = process.env.NEXT_PUBLIC_GAME_HUB_URL || DEFAULT_HUB_URL;

export const getLoginUrl = (returnUrl?: string) => {
  const baseUrl = `${HUB_URL}/login`;
  if (!returnUrl) return baseUrl;
  return `${baseUrl}?returnUrl=${encodeURIComponent(returnUrl)}`;
};

export const getLogoutUrl = () => {
  return `${HUB_URL}/login?logout=true`;
};

export const appendSSOToken = (url: string, token: string) => {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  // 이미 sso_token이 있는 경우 중복 추가 방지
  if (url.includes("sso_token=")) return url;
  return `${url}${separator}sso_token=${token}`;
};
