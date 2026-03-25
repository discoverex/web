import { auth } from "./firebase";

export type ResolvedAuthToken = {
  token: string | null;
  source: "manual" | "firebase" | "session" | "none";
};

export type NormalizedUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  raw: any;
};

export async function resolveAuthToken(
  manualToken?: string,
): Promise<ResolvedAuthToken> {
  if (manualToken) {
    return { token: manualToken, source: "manual" };
  }

  const firebaseToken = await getFirebaseIdToken();
  if (firebaseToken) {
    return { token: firebaseToken, source: "firebase" };
  }

  const sessionToken = getSessionSSOToken();
  if (sessionToken) {
    return { token: sessionToken, source: "session" };
  }

  return { token: null, source: "none" };
}

export async function getFirebaseIdToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return (await auth.currentUser?.getIdToken()) ?? null;
  } catch {
    return null;
  }
}

export function getSessionSSOToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem("sso_token");
}

export function setSessionSSOToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem("sso_token", token);
}

export function clearSessionSSOToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem("sso_token");
}

export function normalizeBackendUser(backendUser: any): NormalizedUser | null {
  const uid = backendUser?.user_id || backendUser?.id || backendUser?.uid;
  const email = backendUser?.email;

  if (!uid || !email) {
    return null;
  }

  return {
    uid,
    email,
    displayName: backendUser.name || backendUser.displayName || email.split("@")[0],
    photoURL: backendUser.photoURL || backendUser.profile_image || null,
    raw: backendUser,
  };
}

export function isLocalServerUrl(apiUrl?: string | null): boolean {
  if (!apiUrl) {
    return false;
  }

  try {
    const parsed = new URL(apiUrl);
    return (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0"
    );
  } catch {
    return false;
  }
}
