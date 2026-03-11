import React from "react";

interface GameBoardHeaderViewProps {
  fileName: string;
  error: string | null;
  aiLevel: number;
  aiLoading: boolean;
  onAiLevelChange: (level: number) => void;
  onGetAiHint: () => void;
  onClose: () => void;
}

export const GameBoardHeaderView: React.FC<GameBoardHeaderViewProps> = ({
  fileName,
  error,
  aiLevel,
  aiLoading,
  onAiLevelChange,
  onGetAiHint,
  onClose,
}) => {
  return (
    <div className="mb-6 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
      <div className="flex flex-col">
        <h2 className="text-base font-bold">
          파일명: <span className="font-mono text-amber-500">{fileName}</span>
        </h2>
        {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
            레벨
          </span>
          <select
            value={aiLevel}
            onChange={(e) => onAiLevelChange(Number(e.target.value))}
            className="bg-zinc-100 dark:bg-zinc-800 text-xs px-2 py-1 rounded-md font-bold focus:outline-none"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onGetAiHint}
          disabled={aiLoading}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            aiLoading
              ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 active:scale-95"
          }`}
        >
          {aiLoading ? "🤖 AI 분석 중..." : "🤖 AI 훈수 듣기"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
