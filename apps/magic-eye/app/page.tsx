"use client";

import React from "react";
import "./game.css";

import { MagicEyeHeader } from "./components/header-controls";
import { GameBoardContainer } from "./components/game-board-container";
import { useQuiz } from "./hooks/use-quiz";

export default function MagicEyeGame() {
  const {
    candidateCount,
    setCandidateCount,
    selectedImageData,
    candidates,
    loading,
    error,
    wrongAnswerId,
    fetchQuiz,
    handleAnswerClick,
    closeGame,
  } = useQuiz();

  return (
    <div className="min-h-screen p-8 font-sans bg-zinc-50 dark:bg-black text-black dark:text-white">
      <MagicEyeHeader />

      <main className="max-w-[1600px] mx-auto">
        <div className="mb-8 flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold opacity-70">정답지 개수 설정:</span>
            <input 
              type="range" 
              min="3" 
              max="10" 
              value={candidateCount} 
              onChange={(e) => setCandidateCount(parseInt(e.target.value))}
              className="w-32 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-lg font-black text-amber-500 w-8">{candidateCount}</span>
          </div>
          <button 
            onClick={fetchQuiz}
            className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-105 transition-transform active:scale-95"
          >
            새로운 퀴즈 생성 🔄
          </button>
        </div>

        {loading && !selectedImageData ? (
          <div className="flex flex-col items-center justify-center min-h-[700px]">
            <div className="text-6xl animate-spin mb-8">🌀</div>
            <p className="text-xl font-bold">퀴즈를 불러오는 중입니다...</p>
          </div>
        ) : (
          <GameBoardContainer
            selectedImageData={selectedImageData}
            candidates={candidates}
            onClose={closeGame}
            onAnswerClick={handleAnswerClick}
            onRestart={fetchQuiz}
            wrongAnswerId={wrongAnswerId}
          />
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl text-center">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
