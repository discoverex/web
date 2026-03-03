import React from 'react';
// @/components/game-canvas 경로가 맞는지 확인해 주세요. 
// 파일명이 'game-canvas.tsx'라면 아래와 같이 불러옵니다.
import GameCanvas from '../../components/game-canvas'; 

const Page = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">렉스를 찾아라!</h1>
        <p className="text-slate-400">숨겨진 대상을 클릭하여 로그를 전송하세요.</p>
      </header>

      <div className="w-full max-w-4xl">
        <GameCanvas />
      </div>
      
      <footer className="mt-8 text-slate-500 text-sm">
        Discoverex TRPG Mini-game Engine v1.0
      </footer>
    </div>
  );
};

export default Page;