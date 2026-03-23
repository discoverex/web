import axios from "axios";
import { auth } from "./firebase";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true, // 쿠키 전송 허용
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // 이미 헤더에 Authorization이 설정되어 있다면 (직접 주입한 경우) 그대로 사용
    if (config.headers.Authorization) return config;

    let token = "";

    // 1. sessionStorage에서 SSO 토큰(자체 JWT) 먼저 확인
    if (typeof window !== "undefined") {
      token = window.sessionStorage.getItem("sso_token") || "";
    }

    if (!token && auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
