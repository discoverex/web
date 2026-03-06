import { FirebaseApp, getApps, getApp, initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 1. 서버 사이드(빌드 시점) 에러를 방지하기 위해
// 실제 초기화는 브라우저에서만 진행하되, 타입은 Auth로 고정합니다.
let app: FirebaseApp;
let auth: Auth;

if (typeof window !== 'undefined') {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);

  // 디버깅 로그 (필요 없으면 나중에 삭제)
  if (!firebaseConfig.apiKey) {
    console.warn('❌ Firebase API Key가 없습니다. Cloud Run 설정을 확인하세요.');
  }
} else {
  // 서버 사이드일 때는 가짜 객체(Proxy)를 넘겨서
  // 다른 파일에서 auth.onAuthStateChanged 등을 호출해도 에러가 안 나게 합니다.
  auth = {
    onAuthStateChanged: () => () => {},
    signOut: () => Promise.resolve(),
  } as unknown as Auth;
}

export { auth };
