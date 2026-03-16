'use client';

import React, { useState, useEffect } from 'react';
import './game.css';

import { GameBoardContainer } from './components/game-board-container';
import { GameLobbyView } from './components/views/game-lobby-view';
import { useQuiz } from './hooks/use-quiz';
import { useGameStore } from '@/store/use-game-store';
import { submitScore } from '@/services/score-service';

type GameState = 'LOBBY' | 'READY' | 'COUNTDOWN' | 'PLAYING' | 'CORRECT';

export default function MagicEyeGame() {
  const {
    candidateCount,
    setCandidateCount,
    selectedImageData,
    candidates,
    correctAnswerId,
    error,
    wrongAnswerId,
    fetchQuiz,
    handleAnswerClick,
    closeGame,
  } = useQuiz();

  const { game_id, game_type, score, startGame, resetGame } = useGameStore();

  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [countdown, setCountdown] = useState(3);

  // 게임 시작 및 퀴즈 불러오기 공통 로직
  const loadNextQuiz = async () => {
    if (gameState === 'LOBBY') {
      startGame();
    }
    setGameState('READY');
    const success = await fetchQuiz();
    if (success) {
      setGameState('COUNTDOWN');
      setCountdown(3);
    } else {
      setGameState('LOBBY');
    }
  };

  const returnToLobby = async () => {
    if (game_id && score > 0) {
      try {
        await submitScore({ game_id, game_type, score });
      } catch (err) {
        console.error('Failed to submit score', err);
      }
    }
    resetGame();
    setGameState('LOBBY');
    closeGame();
  };

  // 카운트다운 로직
  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('PLAYING');
      }
    }
  }, [gameState, countdown]);

  // 정답 처리 핸들러
  const onCorrectAnswer = () => {
    setGameState('CORRECT');
    // 3초간 정답 축하 효과를 보여준 뒤 바로 다음 퀴즈 로드 (공룡 대사 읽을 시간 확보)
    setTimeout(() => {
      loadNextQuiz();
    }, 3000);
  };

  return (
    <div
      className={`w-full max-w-[1600px] mx-auto py-2 font-sans text-black dark:text-white ${wrongAnswerId ? 'animate-shake' : ''}`}
    >
      {/* 점수판 표시 - 위치를 살짝 아래로 조정하고 크기를 조금 줄임 */}
      {gameState !== 'LOBBY' && (
        <div className="fixed top-24 right-6 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-5 py-2 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center animate-in slide-in-from-right duration-500">
          <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">SCORE</span>
          <span className="text-3xl font-black text-amber-500 leading-none">{score}</span>
        </div>
      )}

      <main className="w-full">
        {/* 1. 로비 화면 */}
        {gameState === 'LOBBY' && (
          <GameLobbyView candidateCount={candidateCount} onCountChange={setCandidateCount} onStart={loadNextQuiz} />
        )}

        {/* 2. 로딩 중 화면 */}
        {gameState === 'READY' && (
          <div className="flex flex-col items-center justify-center min-h-[700px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-6xl animate-spin mb-8 text-amber-500">🌀</div>
            <p className="text-2xl font-black tracking-tight">다음 문제를 준비하고 있습니다...</p>
          </div>
        )}

        {/* 3. 카운트다운 화면 */}
        {gameState === 'COUNTDOWN' && (
          <div className="flex flex-col items-center justify-center min-h-[700px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border-4 border-amber-500 animate-pulse">
            <div className="text-[15rem] font-black text-amber-500 leading-none mb-4">
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            <p className="text-2xl font-bold opacity-70">매직아이 속 정답을 찾아보세요!</p>
          </div>
        )}

        {/* 4. 실제 게임 화면 (정답 상태 포함) */}
        {(gameState === 'PLAYING' || gameState === 'CORRECT') && (
          <div className="flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
            <GameBoardContainer
              selectedImageData={selectedImageData}
              candidates={candidates}
              correctAnswerId={correctAnswerId}
              onClose={returnToLobby}
              onAnswerClick={(id) => handleAnswerClick(id, onCorrectAnswer)}
              onRestart={loadNextQuiz}
              wrongAnswerId={wrongAnswerId}
              isCorrect={gameState === 'CORRECT'}
            />
          </div>
        )}

        {error && (
          <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-center font-bold border border-red-100 dark:border-red-900/30">
            {error}
            <button onClick={returnToLobby} className="ml-4 underline hover:opacity-80">
              로비로 돌아가기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
