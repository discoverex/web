import { cookies } from "next/headers";
import { isLocalServerUrl, normalizeBackendUser } from "./auth-helpers";

export async function getServerUser() {
  const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!isLocalServerUrl(apiUrl)) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/auth/users/me`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
        // 백엔드에서 Authorization 헤더도 체크할 수 있으므로 추가
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store", // SSR이므로 항상 최신 정보를 가져옴
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const normalizedUser = normalizeBackendUser(result.data);
    return normalizedUser
      ? {
          uid: normalizedUser.uid,
          email: normalizedUser.email,
          displayName: normalizedUser.displayName,
          photoURL: normalizedUser.photoURL,
          ...normalizedUser.raw,
        }
      : null;
  } catch (error) {
    console.error("Server Auth Error:", error);
    return null;
  }
}
