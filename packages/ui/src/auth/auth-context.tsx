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

const GLOBAL_LOGOUT_COOKIE = "vision_ai_logout_signal";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
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

  // 글로벌 로그아웃 신호 관리 (쿠키 활용 - localhost 포트 간 공유됨)
  const setGlobalLogoutSignal = useCallback(() => {
    if (typeof document !== "undefined") {
      document.cookie = `${GLOBAL_LOGOUT_COOKIE}=true; path=/; max-age=3600; samesite=lax`;
    }
  }, []);

  const clearGlobalLogoutSignal = useCallback(() => {
    if (typeof document !== "undefined") {
      document.cookie = `${GLOBAL_LOGOUT_COOKIE}=; path=/; max-age=0; samesite=lax`;
    }
  }, []);

  const hasGlobalLogoutSignal = useCallback(() => {
    if (typeof document !== "undefined") {
      return document.cookie.includes(GLOBAL_LOGOUT_COOKIE);
    }
    return false;
  }, []);

  const clearLocalAuth = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("sso_token");
    }
    await signOut(auth);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (isLoggingOut) return false;

    // 만약 글로벌 로그아웃 신호가 있다면 백엔드에 묻지 않고 바로 로컬 파기
    if (hasGlobalLogoutSignal()) {
      await clearLocalAuth();
      isInitialCheckDone.current = true;
      setLoading(false);
      return false;
    }

    try {
      const response = await apiClient.get("/auth/users/me");
      if (response.data?.data) {
        const backendUser = response.data.data;
        const newUid = backendUser.id || backendUser.uid;

        setUser((prev: any) => {
          if (
            prev &&
            prev.uid === newUid &&
            prev.profile_image === backendUser.profile_image
          ) {
            return prev; // 참조값을 유지하여 리렌더링 방지
          }
          return {
            uid: newUid,
            email: backendUser.email,
            displayName: backendUser.name || backendUser.displayName,
            photoURL: backendUser.photoURL || backendUser.profile_image,
            ...backendUser,
          };
        });
        return true;
      }
      throw new Error("No session");
    } catch (error: any) {
      if (!isLoggingOut) {
        await clearLocalAuth();
      }
      return false;
    } finally {
      isInitialCheckDone.current = true;
      setLoading(false);
    }
  }, [clearLocalAuth, isLoggingOut, hasGlobalLogoutSignal]);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === "undefined") return;

      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get("sso_token");
      const logoutParam = urlParams.get("logout") === "true";

      // 1. 로그아웃 신호 처리
      if (logoutParam || hasGlobalLogoutSignal()) {
        setIsLoggingOut(true);
        setGlobalLogoutSignal();
        await clearLocalAuth();
        isInitialCheckDone.current = true;
        setLoading(false);
        setTimeout(() => setIsLoggingOut(false), 500);
        return;
      }

      // 2. SSO 토큰 처리
      if (ssoToken) {
        clearGlobalLogoutSignal();
        window.sessionStorage.setItem("sso_token", ssoToken);
        const newUrl =
          window.location.pathname +
          window.location.search
            .replace(/[?&]sso_token=[^&]+/, "")
            .replace(/^&/, "?")
            .replace(/\?$/, "");
        window.history.replaceState({}, "", newUrl);
        // SSO 토큰이 새로 들어왔을 때는 세션 갱신 필요
        await refreshSession();
        return;
      }

      // 3. 백엔드 세션 확인
      // 만약 서버에서 이미 유저를 가져왔다면(initialUser), 
      // 클라이언트에서 즉시 다시 묻지 않고 일단 믿습니다.
      if (initialUser && !isInitialCheckDone.current) {
        isInitialCheckDone.current = true;
        setLoading(false);
      } else if (!isInitialCheckDone.current) {
        await refreshSession();
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // isInitialCheckDone이 false인 동안(초기화 중)에는 
      // Firebase의 초기 null 응답이 서버 유저 정보를 지우지 못하게 차단합니다.
      if (isInitialCheckDone.current && !isLoggingOut) {
        if (fbUser) {
          if (hasGlobalLogoutSignal()) {
            await clearLocalAuth();
          } else {
            await refreshSession();
          }
        } else if (!initialUser) {
          // 서버 유저도 없고 Firebase 유저도 없으면 확실히 null
          setUser(null);
        }
      }
    });

    const handleFocus = () => {
      if (
        document.visibilityState === "visible" &&
        !isLoggingOut &&
        isInitialCheckDone.current
      ) {
        // 포커스 시점에 글로벌 로그아웃 신호가 감지되면 즉시 세션 파기
        if (hasGlobalLogoutSignal()) {
          clearLocalAuth();
        } else {
          refreshSession();
        }
      }
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
    hasGlobalLogoutSignal,
    setGlobalLogoutSignal,
    clearGlobalLogoutSignal,
  ]);

  useEffect(() => {
    if (
      !loading &&
      isInitialCheckDone.current &&
      !user &&
      requireAuth &&
      !isLoggingOut
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
    setGlobalLogoutSignal(); // 글로벌 로그아웃 신호 발생

    try {
      try {
        await apiClient.post("/auth/logout");
      } catch (e) {}
      await clearLocalAuth();
      if (typeof window !== "undefined") {
        window.location.href = getLogoutUrl();
      }
    } catch (error) {
      console.error("Logout Error:", error);
      setIsLoggingOut(false);
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoggingOut(false);
    clearGlobalLogoutSignal(); // 로그인 시 신호 제거
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      if (typeof window !== "undefined")
        window.sessionStorage.setItem("sso_token", token);
      await refreshSession();
    } catch (error) {
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoggingOut(false);
    clearGlobalLogoutSignal(); // 로그인 시 신호 제거
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password: pass,
      });
      const token = response.data.data;
      if (typeof window !== "undefined")
        window.sessionStorage.setItem("sso_token", token);
      await refreshSession();
    } catch (error: any) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        await refreshSession();
      } catch (fbError) {
        throw error;
      }
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoggingOut(false);
    clearGlobalLogoutSignal(); // 로그인 시 신호 제거
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      const token = await result.user.getIdToken();
      if (typeof window !== "undefined")
        window.sessionStorage.setItem("sso_token", token);
      await refreshSession();
    } catch (error) {
      throw error;
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
