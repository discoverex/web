import axios from "axios";
import { resolveAuthToken } from "./auth-helpers";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // 이미 헤더에 Authorization이 설정되어 있다면 (직접 주입한 경우) 그대로 사용
    if (config.headers.Authorization) return config;

    const { token } = await resolveAuthToken();

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
