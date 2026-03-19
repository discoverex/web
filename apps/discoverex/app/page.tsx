'use client';

import React from 'react';
import { useGameState } from '../hooks/use-game-state';
import { useAuth } from '@repo/ui/auth';
import { GameContainer } from '../components/game/game-container';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const { 
    themes, 
    selectedTheme, 
    gameData,
    status, 
    error, 
    handleThemeSelect, 
    resetGame 
  } = useGameState();

  const handleCorrect = (id: string) => {
    console.log('[Home] Correct item found:', id);
    // 향후 Phase 4에서 여기에 Lottie 애니메이션 재생 로직 추가 예정
  };

  const handleAllFound = () => {
    console.log('[Home] All items found! Scene Complete.');
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center font-bold">Checking Auth...</div>;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black p-4 sm:p-8">
      <main className="w-full max-w-4xl flex flex-col items-center">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100 mb-8 w-full text-center">
            {error}
          </div>
        )}

        {!selectedTheme ? (
          <div className="flex flex-col items-center gap-12 py-12 w-full">
            <div className="text-center space-y-3">
              <h2 className="text-5xl font-black tracking-tight">Select a World</h2>
              <p className="text-zinc-500 font-medium">Choose a destination to start your investigation.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {themes.length > 0 ? (
                themes.map(theme => (
                  <button
                    key={theme}
                    onClick={() => handleThemeSelect(theme)}
                    className="p-10 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2rem] hover:border-black dark:hover:border-white transition-all group text-left shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <span className="block text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-4">Location ID</span>
                    <span className="text-xl font-black break-all group-hover:underline underline-offset-4">{theme}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-20 text-center font-bold text-zinc-300 uppercase tracking-widest">
                  No themes available.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 w-full">
            <button 
              onClick={resetGame}
              className="self-start text-[10px] font-black flex items-center gap-2 text-zinc-400 hover:text-black transition-colors uppercase tracking-[0.2em]"
            >
              ← Return to Hub
            </button>
            
            <div className="w-full">
              {status === 'loading' ? (
                <div className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-12 shadow-2xl flex flex-col items-center gap-8">
                  <div className="text-center space-y-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Current Scene</span>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">{selectedTheme}</h2>
                  </div>
                  <div className="py-24 flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-4 border-zinc-100 border-t-black dark:border-zinc-800 dark:border-t-white rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] animate-pulse">Syncing Data...</p>
                  </div>
                </div>
              ) : (
                gameData && (
                  <GameContainer 
                    gameData={gameData} 
                    onCorrect={handleCorrect}
                    onAllFound={handleAllFound}
                  />
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
