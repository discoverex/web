import axios from "axios";
import { auth } from "./firebase";

const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    let token = "";

    // 1. sessionStorage에서 SSO 토큰(자체 JWT) 먼저 확인
    if (typeof window !== "undefined") {
      token = window.sessionStorage.getItem("sso_token") || "";
    }

    // 2. SSO 토큰이 없다면 Firebase Auth에서 토큰 가져오기 시도
    if (!token) {
      const user = auth.currentUser;
      if (user) {
        token = await user.getIdToken();
      }
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
