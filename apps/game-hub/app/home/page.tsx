'use client';

import React from 'react';
import { useAuth, auth } from '@repo/ui/auth';
import { menus } from '../consts/menus';

export default function Home(): React.ReactElement {
  const { user } = useAuth();

  const handleGameStart = async (menuName: string) => {
    const menu = menus.find(m => m.name === menuName);
    if (!menu) return;

    let finalPath = menu.path;
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      const token = await currentUser.getIdToken();
      const separator = finalPath.includes('?') ? '&' : '?';
      finalPath = `${finalPath}${separator}sso_token=${token}`;
    } else {
      const ssoToken = window.sessionStorage.getItem('sso_token');
      if (ssoToken) {
        const separator = finalPath.includes('?') ? '&' : '?';
        finalPath = `${finalPath}${separator}sso_token=${ssoToken}`;
      }
    }
    
    window.location.href = finalPath;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
        Vision AI GAMES World
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
        비전 AI 기술을 활용한 다양하고 재미있는 게임들을 경험해보세요. 로그인하시면 게임 점수를 저장하고 랭킹에 참여하실
        수 있습니다.
      </p>

      {user ? (
        <div className="flex gap-4">
          <button onClick={() => handleGameStart('렉스를 찾아라!')} className="btn btn-primary btn-lg">
            게임 시작하기 (렉스를 찾아라!)
          </button>
          <button onClick={() => handleGameStart('퀴즈 매직아이')} className="btn btn-secondary btn-lg">
            퀴즈 매직아이 도전
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <button onClick={() => window.location.href = '/login'} className="btn btn-primary btn-wide btn-lg shadow-lg">
            지금 바로 시작하기
          </button>
          <p className="text-sm opacity-70 italic">게임을 즐기려면 로그인이 필요합니다.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-4xl">
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-amber-600">렉스를 찾아라!</h2>
            <p>다양한 이미지 속에 숨어있는 렉스를 Vision AI의 도움을 받아 찾아보세요.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-orange-600">퀴즈 매직아이</h2>
            <p>Vision AI가 생성한 신비로운 매직아이 속에 숨겨진 정답을 맞춰보세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
