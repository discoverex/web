import axios from 'axios';
import { auth } from './firebase';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // 1. Firebase Auth에서 토큰 가져오기 시도
    let token = '';
    const user = auth.currentUser;
    if (user) {
      token = await user.getIdToken();
    } 
    
    // 2. Firebase User가 없다면 sessionStorage에서 SSO 토큰 확인 (도메인 공유용)
    if (!token && typeof window !== 'undefined') {
      token = window.sessionStorage.getItem('sso_token') || '';
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
