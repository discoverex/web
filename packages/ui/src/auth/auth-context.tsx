"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
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

interface AuthContextType {
  user: any | null; // Firebase User 또는 백엔드에서 받은 UserInfo
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMyInfoFromBackend = async () => {
    try {
      const response = await apiClient.get("/auth/users/me");
      // 백엔드에서 성공적으로 정보를 가져오면 유저 상태로 설정
      if (response.data?.data) {
        // Firebase User 객체와 호환되도록 최소한의 필드 유지
        const backendUser = response.data.data;
        setUser((prev: any) => ({
          ...prev,
          uid: backendUser.id || prev?.uid,
          email: backendUser.email || prev?.email,
          displayName: backendUser.name || prev?.displayName,
          photoURL: backendUser.photoURL || backendUser.profile_image || prev?.photoURL,
          ...backendUser,
        }));
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        await logout();
      }
      return null;
    }
  };

  useEffect(() => {
    // 1. URL 파라미터에서 SSO 토큰 확인
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get("sso_token");
      if (ssoToken) {
        window.sessionStorage.setItem("sso_token", ssoToken);
        // URL에서 토큰 제거 (보안 및 미관상)
        const newUrl =
          window.location.pathname +
          window.location.search
            .replace(/[?&]sso_token=[^&]+/, "")
            .replace(/^&/, "?")
            .replace(/\?$/, "");
        window.history.replaceState({}, "", newUrl);
      }
    }

    // JWT 디코딩 함수 (Base64)
    const decodeToken = (token: string) => {
      try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    };

    // 2. Firebase 인증 상태 감시
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(false);
        await fetchMyInfoFromBackend();
      } else {
        // Firebase User가 없어도 sessionStorage에 토큰이 있다면 정보 추출 및 백엔드 인증 시도
        const savedToken =
          typeof window !== "undefined"
            ? window.sessionStorage.getItem("sso_token")
            : null;
        
        if (savedToken) {
          const decoded = decodeToken(savedToken);
          if (decoded) {
            // 토큰 정보를 기반으로 임시 유저 객체 생성
            setUser({
              uid: decoded.user_id || decoded.sub,
              email: decoded.email,
              displayName: decoded.name,
              photoURL: decoded.picture,
              isAnonymous: false,
            });
          }
          await fetchMyInfoFromBackend();
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("sso_token", token);
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const token = await result.user.getIdToken();
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("sso_token", token);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      const token = await result.user.getIdToken();
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("sso_token", token);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("sso_token");
      }
      setUser(null);
    } catch (error) {
      console.error("로그아웃 에러:", error);
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
