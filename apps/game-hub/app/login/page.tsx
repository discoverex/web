'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { appendSSOToken, resolveAuthToken, useAuth } from '@repo/ui/auth';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent(): React.JSX.Element {
  const { user, loginWithGoogle, loginWithEmail, signUpWithEmail, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleRedirect = async () => {
      // 로그아웃 요청 중이라면 리다이렉트 로직을 수행하지 않음
      if (searchParams.get('logout') === 'true') return;

      if (user) {
        if (returnUrl) {
          const { token } = await resolveAuthToken();
          window.location.href = token ? appendSSOToken(returnUrl, token) : returnUrl;
        } else {
          router.push('/');
        }
      }
    };

    handleRedirect();
  }, [user, router, returnUrl, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || '인증에 실패했습니다.');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">로딩 중...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold text-center block w-full mb-6">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold">이름</span>
                </label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="input input-bordered w-full focus:input-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">이메일</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered w-full focus:input-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label flex justify-between">
                <span className="label-text font-semibold">비밀번호</span>
                {!isSignUp && <span className="label-text-alt link link-hover">비밀번호 찾기</span>}
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="input input-bordered w-full focus:input-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert alert-error py-2 text-sm mt-2">
                <span>{error}</span>
              </div>
            )}

            <div className="form-control mt-4">
              <button type="submit" className="btn btn-primary w-full text-lg">
                {isSignUp ? '가입하기' : '로그인'}
              </button>
            </div>
          </form>

          <div className="divider my-6 text-gray-400">또는</div>

          <button onClick={loginWithGoogle} className="btn btn-outline btn-neutral w-full gap-3 font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Google 계정으로 계속하기
          </button>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
              <button type="button" className="link link-primary font-bold ml-2" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? '로그인하기' : '회원가입하기'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-160px)]">로딩 중...</div>}>
      <LoginContent />
    </Suspense>
  );
}
