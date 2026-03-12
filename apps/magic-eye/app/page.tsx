"use client";

import React, { useState, useEffect } from "react";
import "./game.css";

import { GameBoardContainer } from "./components/game-board-container";
import { GameLobbyView } from "./components/views/game-lobby-view";
import { useQuiz } from "./hooks/use-quiz";

type GameState = "LOBBY" | "READY" | "COUNTDOWN" | "PLAYING";

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

  const [gameState, setGameState] = useState<GameState>("LOBBY");
  const [countdown, setCountdown] = useState(3);

  // 게임 시작 버튼 클릭 핸들러
  const handleStartGame = async () => {
    setGameState("READY");
    const success = await fetchQuiz();
    if (success) {
      setGameState("COUNTDOWN");
      setCountdown(3);
    } else {
      setGameState("LOBBY");
    }
  };

  // 카운트다운 로직
  useEffect(() => {
    if (gameState === "COUNTDOWN") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState("PLAYING");
      }
    }
  }, [gameState, countdown]);

  // 새로운 퀴즈 요청 (게임 중 재시작)
  const handleRestart = async () => {
    setGameState("READY");
    const success = await fetchQuiz();
    if (success) {
      setGameState("COUNTDOWN");
      setCountdown(3);
    }
  };

  // 로비로 돌아가기
  const handleGoToLobby = () => {
    setGameState("LOBBY");
    closeGame();
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-4 font-sans text-black dark:text-white">
      <main className="w-full">
        
        {/* 1. 로비 화면 (설정) */}
        {gameState === "LOBBY" && (
          <GameLobbyView 
            candidateCount={candidateCount}
            onCountChange={setCandidateCount}
            onStart={handleStartGame}
          />
        )}

        {/* 2. 로딩 중 화면 */}
        {gameState === "READY" && (
          <div className="flex flex-col items-center justify-center min-h-[700px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-6xl animate-spin mb-8 text-amber-500">🌀</div>
            <p className="text-2xl font-black tracking-tight">이미지를 분석하고 있습니다...</p>
          </div>
        )}

        {/* 3. 카운트다운 화면 */}
        {gameState === "COUNTDOWN" && (
          <div className="flex flex-col items-center justify-center min-h-[700px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border-4 border-amber-500 animate-pulse">
            <div className="text-[15rem] font-black text-amber-500 leading-none mb-4">
              {countdown === 0 ? "GO!" : countdown}
            </div>
            <p className="text-2xl font-bold opacity-70">매직아이 속 정답을 찾아보세요!</p>
          </div>
        )}

        {/* 4. 실제 게임 화면 */}
        {gameState === "PLAYING" && (
          <div className="flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
            <GameBoardContainer
              selectedImageData={selectedImageData}
              candidates={candidates}
              onClose={handleGoToLobby}
              onAnswerClick={handleAnswerClick}
              onRestart={handleRestart}
              wrongAnswerId={wrongAnswerId}
            />
          </div>
        )}

        {error && (
          <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-center font-bold border border-red-100 dark:border-red-900/30">
            {error}
            <button 
              onClick={handleGoToLobby}
              className="ml-4 underline hover:opacity-80"
            >
              로비로 돌아가기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
