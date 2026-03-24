import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/use-game-store';

interface GameLobbyViewProps {
  candidateCount: number;
  onCountChange: (count: number) => void;
  onStart: () => void;
}

export const GameLobbyView: React.FC<GameLobbyViewProps> = ({ candidateCount, onCountChange, onStart }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const resetGame = useGameStore((state) => state.resetGame);

  useEffect(() => {
    if (showHelp) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setShowHelp(false);
          setIsExiting(false);
        }, 600);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showHelp]);

  return (
    <div className="flex flex-col items-center justify-center min-h-175 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center relative overflow-hidden">
      {/* 도움말 말풍선 (왼쪽) */}
      {showHelp && (
        <div
          className={`absolute top-12 left-12 z-60 flex items-end gap-3 ${isExiting ? 'animate-exit-left' : 'animate-hint-left'}`}
        >
          <div className="text-5xl filter drop-shadow-lg">🎓</div>
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-2xl border-2 border-blue-500 max-w-md text-left relative">
            <h4 className="font-black text-blue-600 dark:text-blue-400 mb-2">🎓 척척박사의 비밀 가이드</h4>
            <ul className="text-xs space-y-2 font-bold opacity-80 leading-relaxed">
              <li>
                ✨ <span className="text-blue-500">기본 점수:</span> 정답지 개수 × 10점을 드립니다! (50개 선택 시 500점)
              </li>
              <li>
                ⏰ <span className="text-amber-500">시간 보너스:</span> 1분 내 정답을 맞히면 남은 시간(초) × 10점을
                추가로 드려요!
              </li>
              <li>
                🤖 <span className="text-purple-500">AI 훈수:</span> 레벨 2부터 점수가 소모됩니다. (레벨-1) × 10점씩
                차감되니 주의하세요!
              </li>
              <li>
                💾 <span className="text-emerald-500">연속 플레이:</span> 스테이지를 클리어해도 점수는 유지됩니다.
                &#39;게임 종료&#39;를 눌러야 최종 저장돼요!
              </li>
            </ul>
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white dark:bg-zinc-800 border-l-2 border-b-2 border-blue-500 rotate-45" />
          </div>
        </div>
      )}

      {/* 도움말 버튼 (우측 하단) */}
      <div className="absolute right-8 bottom-8 flex gap-4">
        <button
          onClick={() => setShowHelp(true)}
          className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl font-black hover:bg-blue-500 hover:text-white transition-all active:scale-90 shadow-sm border border-zinc-200 dark:border-zinc-700"
        >
          ?
        </button>
      </div>

      {/* 게임 새로 시작하기 버튼 (좌측 하단) */}
      <div className="absolute left-8 bottom-8">
        <button
          onClick={() => {
            if (confirm('현재까지의 모든 점수가 초기화됩니다. 정말로 새로 시작하시겠습니까?')) {
              resetGame();
            }
          }}
          className="px-6 py-3 rounded-2xl text-xs font-black bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm border border-red-100 dark:border-red-900/30 dark:bg-red-900/10"
        >
          🔄 게임 새로 시작하기
        </button>
      </div>

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
