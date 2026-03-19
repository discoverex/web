'use client';

import React, { useRef } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { useGameState } from '../hooks/use-game-state';
import { useAuth } from '@repo/ui/auth';
import { GameContainer } from '../components/game/game-container';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const playerRef = useRef<any>(null);
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
    if (playerRef.current) {
      playerRef.current.seek(0);
      playerRef.current.play();
    }
  };

  const handleAllFound = () => {
    console.log('[Home] All items found! Scene Complete.');
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center font-bold">Checking Auth...</div>;

  const lottieSrc = gameData?.lottie || '/rex-animation.json';
  console.log(lottieSrc);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black p-4 sm:p-8">
      <main className="w-full max-w-4xl flex flex-col items-center">
        {error && (
          <div className="bg-red-50 text-red-500 p-6 rounded-[1.5rem] text-sm font-black border-2 border-red-100 mb-8 w-full text-center animate-bounce">
            ⚠️ {error}
          </div>
        )}

        {!selectedTheme ? (
          <div className="flex flex-col items-center gap-16 py-12 w-full">
            <div className="text-center space-y-4">
              <h2 className="text-6xl font-black tracking-tighter uppercase italic">Select World</h2>
              <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-sm">Choose a sector to initiate artifact scanning</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
              {themes.length > 0 ? (
                themes.map(theme => (
                  <button
                    key={theme}
                    onClick={() => handleThemeSelect(theme)}
                    className="relative p-12 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[3rem] hover:border-black dark:hover:border-white transition-all group text-left shadow-md hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                    </div>
                    <span className="block text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4">Sector ID</span>
                    <span className="text-2xl font-black break-all group-hover:underline underline-offset-8 decoration-4">{theme}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-32 text-center">
                  <div className="w-20 h-20 border-4 border-zinc-100 border-t-zinc-300 rounded-full animate-spin mx-auto mb-6" />
                  <p className="font-black text-zinc-300 uppercase tracking-[0.4em]">Establishing Uplink...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-10 w-full animate-in fade-in zoom-in-95 duration-500">
            <button 
              onClick={resetGame}
              className="self-start text-[10px] font-black flex items-center gap-3 text-zinc-400 hover:text-black dark:hover:text-white transition-all uppercase tracking-[0.3em] group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Command Center
            </button>
            
            <div className="w-full">
              {status === 'loading' ? (
                <div className="w-full bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-zinc-50 dark:border-zinc-800 p-20 shadow-2xl flex flex-col items-center gap-10">
                  <div className="text-center space-y-3">
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] animate-pulse">Syncing Satellite Uplink</span>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic">{selectedTheme}</h2>
                  </div>
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-8 border-zinc-100 dark:border-zinc-800 rounded-full" />
                    <div className="absolute inset-0 border-8 border-t-black dark:border-t-white rounded-full animate-spin" />
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
