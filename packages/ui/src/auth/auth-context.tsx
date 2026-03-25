"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import apiClient from "./api-client";
import { getLoginUrl, getLogoutUrl } from "./constants";
import {
  clearSessionSSOToken,
  normalizeBackendUser,
  resolveAuthToken,
  setSessionSSOToken,
} from "./auth-helpers";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: (manualToken?: string, force?: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  requireAuth = false,
  initialUser = null,
}: {
  children: ReactNode;
  requireAuth?: boolean;
  initialUser?: any | null;
}): React.ReactElement {
  const [user, setUser] = useState<any | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isInitialCheckDone = useRef(!!initialUser);
  const lastCheckTime = useRef(0);

  const clearLocalAuth = useCallback(async () => {
    clearSessionSSOToken();
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut error:", e);
    }
    setUser(null);
    isInitialCheckDone.current = true; // 세션이 비었음을 명시
  }, []);

  const isRefreshing = useRef(false); // 중복 호출 방지용 Lock

  const refreshSession = useCallback(
    async (manualToken?: string, force: boolean = false) => {
      if (isLoggingOut || (!manualToken && isRefreshing.current)) return false;

      const now = Date.now();
      const shouldSkipCooldown = !!manualToken || force;
      if (!shouldSkipCooldown && now - lastCheckTime.current < 2000) {
        return false;
      }

      isRefreshing.current = true;
      lastCheckTime.current = now;

      try {
        const { token } = await resolveAuthToken(manualToken);

        if (!token) {
          await clearLocalAuth();
          return false;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const response = await apiClient.get("/auth/users/me", config);
        if (response.data?.data) {
          const normalizedUser = normalizeBackendUser(response.data.data);
          if (!normalizedUser) {
            throw new Error("Invalid session payload");
          }

          setUser((prev: any) => {
            if (
              prev &&
              prev.uid === normalizedUser.uid &&
              prev.email === normalizedUser.email &&
              prev.displayName === normalizedUser.displayName &&
              prev.photoURL === normalizedUser.photoURL
            ) {
              return prev;
            }

            return {
              uid: normalizedUser.uid,
              email: normalizedUser.email,
              displayName: normalizedUser.displayName,
              photoURL: normalizedUser.photoURL,
            };
          });
          return true;
        }
        throw new Error("No session");
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          await clearLocalAuth();
        }
        return false;
      } finally {
        isInitialCheckDone.current = true;
        setLoading(false);
        isRefreshing.current = false;
      }
    },
    [clearLocalAuth, isLoggingOut],
  );

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === "undefined") return;

      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get("sso_token");
      const logoutParam = urlParams.get("logout") === "true";

      if (logoutParam) {
        setIsLoggingOut(true);
        await clearLocalAuth();
        isInitialCheckDone.current = true;
        setLoading(false);
        setTimeout(() => setIsLoggingOut(false), 500);
        return;
      }

      if (ssoToken) {
        setSessionSSOToken(ssoToken);

        const success = await refreshSession(ssoToken);

        const newUrl =
          window.location.pathname +
          window.location.search
            .replace(/[?&]sso_token=[^&]+/, "")
            .replace(/^&/, "?")
            .replace(/\?$/, "");
        window.history.replaceState({}, "", newUrl);

        if (!success && requireAuth) {
          window.location.href = getLoginUrl(window.location.href);
        }
        return;
      }

      if (!isInitialCheckDone.current) {
        if (initialUser) {
          setUser(initialUser);
          isInitialCheckDone.current = true;
          setLoading(false);
          refreshSession();
        } else {
          await refreshSession();
        }
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (isInitialCheckDone.current && !isLoggingOut) {
        if (fbUser) {
          await refreshSession(undefined, true);
        } else if (!initialUser) {
          setUser(null);
        }
      }
    });

    const handleFocus = () => {
      if (
        document.visibilityState !== "visible" ||
        isLoggingOut ||
        !isInitialCheckDone.current
      )
        return;

      refreshSession();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [
    refreshSession,
    clearLocalAuth,
    initialUser,
    requireAuth,
  ]);

  useEffect(() => {
    if (
      !loading &&
      isInitialCheckDone.current &&
      !user &&
      requireAuth &&
      !isLoggingOut &&
      !isRefreshing.current // 갱신 중에는 리다이렉트하지 않음
    ) {
      if (typeof window !== "undefined") {
        if (window.location.pathname.startsWith("/login")) return;
        window.location.href = getLoginUrl(window.location.href);
      }
    }
  }, [loading, user, requireAuth, isLoggingOut]);

  const logout = async () => {
    setIsLoggingOut(true);
    setLoading(true);

    try {
      await apiClient.post("/auth/logout").catch(() => {});
      await clearLocalAuth();
      if (typeof window !== "undefined") {
        window.location.href = getLogoutUrl();
      }
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsLoggingOut(false), 1000);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoggingOut(false);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      setSessionSSOToken(token);
      await refreshSession(token);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoggingOut(false);
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password: pass,
      });
      const token = response.data.data;
      setSessionSSOToken(token);
      await refreshSession(token);
    } catch (error: any) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        const token = (await auth.currentUser?.getIdToken()) || undefined;
        if (token) {
          setSessionSSOToken(token);
        }
        await refreshSession(token);
      } catch {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoggingOut(false);
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      const token = await result.user.getIdToken();
      setSessionSSOToken(token);
      await refreshSession(token);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
