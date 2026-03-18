import React from 'react';

interface GameBoardHeaderViewProps {
  fileName: string;
  error: string | null;
  aiLevel: number;
  aiLoading: boolean;
  onAiLevelChange: (level: number) => void;
  onGetAiHint: () => void;
  onClose: () => void;
  isCorrect?: boolean;
  isSubmitting?: boolean;
}

export const GameBoardHeaderView: React.FC<GameBoardHeaderViewProps> = ({
  error,
  aiLevel,
  aiLoading,
  onAiLevelChange,
  onGetAiHint,
  onClose,
  isCorrect,
  isSubmitting,
}) => {
  return (
    <div className="mb-6 flex flex-wrap justify-center items-center gap-6 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
      <div className="flex flex-col items-center">
        {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
      </div>

      <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">레벨</span>
          <select
            value={aiLevel}
            onChange={(e) => onAiLevelChange(Number(e.target.value))}
            disabled={isCorrect || isSubmitting}
            className={`bg-transparent text-xs font-black focus:outline-none text-zinc-900 dark:text-white ${isCorrect || isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onGetAiHint}
          disabled={aiLoading || isCorrect || isSubmitting}
          className={`px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-lg ${
            aiLoading || isCorrect || isSubmitting
              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-purple-500/20'
          }`}
        >
          {aiLoading ? '🤖 AI 분석 중...' : '🤖 AI 훈수 듣기'}
        </button>
        <button
          onClick={onClose}
          disabled={isCorrect || isSubmitting}
          className={`px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-sm active:scale-95 ${
            isCorrect || isSubmitting
              ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
              : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
          }`}
        >
          {isSubmitting ? '종료 중...' : '닫기'}
        </button>
      </div>
    </div>
  );
};
