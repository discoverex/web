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
  // 5초 이내에 재실행되지 않도록 간단한 시간 체크 추가
  const lastCheckTime = useRef(0);

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
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut error:", e);
    }
    setUser(null);
  }, []);

  const isRefreshing = useRef(false); // 중복 호출 방지용 Lock

  const refreshSession = useCallback(
    async (manualToken?: string, force: boolean = false) => {
      // manualToken이 있을 때는 기존 실행 중인 락(isRefreshing)을 무시하고 강제 진행합니다.
      if (isLoggingOut || (!manualToken && isRefreshing.current)) return false;

      // 쿨타임 체크 추가 (함수 진입 시점에서도 보호)
      // manualToken이 있거나 force가 true면 쿨타임을 무시합니다.
      const now = Date.now();
      const shouldSkipCooldown = !!manualToken || force;
      if (!shouldSkipCooldown && now - lastCheckTime.current < 2000)
        return false;

      isRefreshing.current = true; // 실행 시작 시 잠금
      lastCheckTime.current = now;

      // 만약 글로벌 로그아웃 신호가 있다면 백엔드에 묻지 않고 바로 로컬 파기
      if (hasGlobalLogoutSignal()) {
        await clearLocalAuth();
        isInitialCheckDone.current = true;
        setLoading(false);
        return false;
      }

      try {
        const config = manualToken
          ? { headers: { Authorization: `Bearer ${manualToken}` } }
          : {};

        const response = await apiClient.get("/auth/users/me", config);
        if (response.data?.data) {
          const backendUser = response.data.data;
          const newUid = backendUser.id || backendUser.uid;

          setUser((prev: any) => {
            // 필요한 핵심 필드만 비교
            const isSameUser =
              prev &&
              prev.uid === newUid &&
              prev.email === backendUser.email &&
              prev.photoURL ===
                (backendUser.photoURL || backendUser.profile_image);

            if (isSameUser) return prev; // 데이터가 같으면 '절대' 새 객체를 만들지 않음

            // 꼭 필요한 데이터만 정제해서 저장 (서버의 가변 필드 제외)
            return {
              uid: newUid,
              email: backendUser.email,
              displayName: backendUser.name || backendUser.displayName,
              photoURL: backendUser.photoURL || backendUser.profile_image,
            };
          });
          return true;
        }
        throw new Error("No session");
      } catch (error: any) {
        if (error.response?.status === 401) {
          await clearLocalAuth(); // 확실한 세션 만료 시에만 파기
        }
        // 그 외의 에러(500 등)는 세션을 유지하며 false만 반환
        return false;
      } finally {
        isInitialCheckDone.current = true;
        setLoading(false);
        isRefreshing.current = false; // 실행 완료 후 잠금 해제
      }
    },
    [clearLocalAuth, isLoggingOut, hasGlobalLogoutSignal],
  );

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

        // 1. 먼저 세션을 확실히 갱신
        const success = await refreshSession(ssoToken);

        // 2. 세션 갱신에 성공했을 때만 URL을 청소
        if (success) {
          const newUrl =
            window.location.pathname +
            window.location.search
              .replace(/[?&]sso_token=[^&]+/, "")
              .replace(/^&/, "?")
              .replace(/\?$/, "");
          window.history.replaceState({}, "", newUrl);
        }
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
            await refreshSession(undefined, true);
          }
        } else if (!initialUser) {
          // 서버 유저도 없고 Firebase 유저도 없으면 확실히 null
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

      // 이미 refreshSession 내부에서 쿨타임을 체크하므로 호출만 하면 됨
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
      !isLoggingOut &&
      !isRefreshing.current
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
      await apiClient.post("/auth/logout").catch(() => {});
      await clearLocalAuth();
      if (typeof window !== "undefined") {
        window.location.href = getLogoutUrl();
      }
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
      // 리다이렉트가 일어나지 않았을 경우를 대비해 일정 시간 후 해제
      setTimeout(() => setIsLoggingOut(false), 1000);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoggingOut(false);
    setLoading(true);
    clearGlobalLogoutSignal(); // 로그인 시 신호 제거
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      if (typeof window !== "undefined")
        window.sessionStorage.setItem("sso_token", token);
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
    clearGlobalLogoutSignal(); // 로그인 시 신호 제거
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password: pass,
      });
      const token = response.data.data;
      if (typeof window !== "undefined")
        window.sessionStorage.setItem("sso_token", token);
      await refreshSession(token);
    } catch (error: any) {
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        const token = (await auth.currentUser?.getIdToken()) || undefined;
        await refreshSession(token);
      } catch (fbError) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoggingOut(false);
    setLoading(true);
    clearGlobalLogoutSignal(); // 로그인 시 신호 제거
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      const token = await result.user.getIdToken();
      if (typeof window !== "undefined")
        window.sessionStorage.setItem("sso_token", token);
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
