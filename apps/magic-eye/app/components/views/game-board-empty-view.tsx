import React from 'react';

interface GameBoardEmptyViewProps {
  onRestart?: () => void;
}

export const GameBoardEmptyView: React.FC<GameBoardEmptyViewProps> = ({ onRestart }) => {
  return (
    <section className="lg:col-span-full bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[700px] relative overflow-hidden">
      <div className="text-center p-20 flex flex-col items-center">
        <div className="mb-10 text-9xl animate-bounce drop-shadow-2xl">🦖</div>
        <h3 className="text-4xl font-black mb-4 tracking-tighter">게임이 종료되었습니다</h3>
        <p className="opacity-50 text-lg max-w-md mx-auto mb-10">
          모든 비밀을 찾으셨나요? 다시 도전하고 싶으시면 아래 버튼을 눌러주세요!
        </p>

        <button
          onClick={onRestart}
          className="px-10 py-5 bg-amber-500 text-white rounded-3xl text-xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
        >
          🎮 게임 다시 시작하기
        </button>
      </div>
    </section>
  );
};
