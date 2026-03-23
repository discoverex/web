import { cookies } from "next/headers";

export async function getServerUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL;

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
    const backendUser = result.data;

    if (!backendUser) return null;

    return {
      uid: backendUser.id || backendUser.uid,
      email: backendUser.email,
      displayName: backendUser.name || backendUser.displayName,
      photoURL: backendUser.photoURL || backendUser.profile_image,
      ...backendUser,
    };
  } catch (error) {
    console.error("Server Auth Error:", error);
    return null;
  }
}
