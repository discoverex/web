import React from 'react';

interface GameLobbyViewProps {
  candidateCount: number;
  onCountChange: (count: number) => void;
  onStart: () => void;
}

export const GameLobbyView: React.FC<GameLobbyViewProps> = ({ candidateCount, onCountChange, onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[700px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
      <div className="text-8xl mb-8 animate-bounce">🦖</div>
      <h1 className="text-5xl font-black mb-4 tracking-tight">MAGIC EYE GAME</h1>
      <p className="text-xl opacity-60 mb-12 font-medium">매직아이 속에 숨겨진 정답을 찾아보세요!</p>

      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-8 rounded-3xl mb-12 w-full max-w-md border border-zinc-100 dark:border-zinc-700">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">정답지 개수 설정</span>
            <span className="text-3xl font-black text-amber-500">{candidateCount}</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={candidateCount}
            onChange={(e) => onCountChange(parseInt(e.target.value))}
            className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <p className="text-sm opacity-50 font-medium">개수가 많을수록 난이도가 올라갑니다.</p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="group relative px-12 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-2xl hover:scale-105 transition-all active:scale-95 shadow-xl hover:shadow-amber-500/20"
      >
        게임 시작하기 🚀
        <div className="absolute inset-0 rounded-2xl bg-amber-500/20 scale-0 group-hover:scale-110 transition-transform -z-10 blur-xl"></div>
      </button>
    </div>
  );
};
