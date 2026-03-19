'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useAuth } from '@repo/ui/auth';
import rexAnimation from '../public/rex-animation.json';
import { GameContainer } from '../components/game/game-container';
import { GameMetadata, LayerListResponse, ThemeListResponse } from '../types/game';
import { API_BASE_URL } from '../consts/API_BASE_URL';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<GameMetadata | null>(null);
  const [layersResponse, setLayersResponse] = useState<LayerListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. 테마 목록 조회
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/discoverex/themes`);
        const data: ThemeListResponse = await res.json();
        if (data.status === 'success') {
          setThemes(data.data.themes);
        }
      } catch (err) {
        console.error('Failed to fetch themes:', err);
      }
    };
    fetchThemes();
  }, []);

  // 2. 테마 선택 시 데이터 로드
  const handleThemeSelect = async (themeName: string) => {
    setIsLoading(true);
    setSelectedTheme(themeName);
    try {
      // 레이어 및 매니페스트 통합 조회
      const res = await fetch(`${API_BASE_URL}/discoverex/themes/${themeName}/layers`);
      const data: LayerListResponse = await res.json();
      
      if (data.status === 'success') {
        setLayersResponse(data);
        // lottie 데이터가 있다면 업데이트 (필요 시)
      }
    } catch (err) {
      console.error('Failed to load theme data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCorrect = () => {
    if (lottieRef.current) {
      lottieRef.current.stop();
      lottieRef.current.play();
    }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center font-bold">Checking Auth...</div>;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black p-4 sm:p-8">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12">
            <Lottie 
              lottieRef={lottieRef} 
              animationData={layersResponse?.data?.lottie ? undefined : rexAnimation}
              path={layersResponse?.data?.lottie} // URL이 있으면 path 사용
              loop={false} 
              autoplay={false} 
            />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Discoverex</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full shadow-sm border border-zinc-100">
            <span className="text-sm font-bold truncate max-w-[120px]">{user.displayName || user.email}</span>
            <button onClick={logout} className="text-xs text-red-500 font-bold hover:underline">LOGOUT</button>
          </div>
        )}
      </header>

      <main className="w-full max-w-4xl">
        {!selectedTheme ? (
          <div className="flex flex-col items-center gap-8 py-20">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black tracking-tight">Select a World</h2>
              <p className="text-zinc-500">Choose a theme to start your investigation.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              {themes.map(theme => (
                <button
                  key={theme}
                  onClick={() => handleThemeSelect(theme)}
                  className="p-8 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-black dark:hover:border-white transition-all group text-left"
                >
                  <span className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Theme ID</span>
                  <span className="text-lg font-black break-all group-hover:underline">{theme}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => { setSelectedTheme(null); setLayersResponse(null); }}
              className="self-start text-sm font-bold flex items-center gap-2 text-zinc-400 hover:text-black transition-colors"
            >
              ← Back to Themes
            </button>
            
            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
                <p className="font-bold text-zinc-400">Loading Scene...</p>
              </div>
            ) : (
              layersResponse && (
                <GameContainer 
                  gameData={layersResponse.data} 
                  onCorrect={handleCorrect}
                />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
