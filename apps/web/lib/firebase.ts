import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 브라우저 환경에서만 상세 로깅 수행
if (typeof window !== 'undefined') {
  console.log('--- Firebase 초기화 디버깅 시작 ---');
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.error('❌ 다음 환경 변수가 누락되었습니다:', missingKeys);
    console.warn('현재 로드된 process.env 확인 (일부):', {
      API_KEY_EXISTS: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      PROJECT_ID_EXISTS: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    console.log('✅ 모든 Firebase 설정값이 로드되었습니다.');
    // API Key의 앞/뒤 3글자만 노출하여 실제 값이 들어왔는지 확인
    const key = firebaseConfig.apiKey || '';
    console.log(`API Key 확인: ${key.slice(0, 3)}...${key.slice(-3)}`);
  }
  console.log('--- Firebase 초기화 디버깅 종료 ---');
}

const app: FirebaseApp = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };
export default app;
