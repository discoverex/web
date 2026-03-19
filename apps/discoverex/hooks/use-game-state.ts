import { useState, useEffect, useCallback } from 'react';
import { GameService } from '../services/game-service';
import { LayerListResponse, GameStatus } from '../types/game';

/**
 * 게임의 전반적인 상태와 데이터 로딩을 관리하는 훅입니다.
 */
export const useGameState = () => {
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [gameData, setGameData] = useState<LayerListResponse['data'] | null>(null);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // 1. 테마 목록 가져오기
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const list = await GameService.fetchThemes();
        setThemes(list);
      } catch (err) {
        setError('Failed to load themes.');
      }
    };
    loadThemes();
  }, []);

  // 2. 테마 선택 시 게임 데이터 로드
  const handleThemeSelect = useCallback(async (themeName: string) => {
    setStatus('loading');
    setSelectedTheme(themeName);
    setError(null);
    
    try {
      const data = await GameService.fetchThemeLayers(themeName);
      setGameData(data);
      setStatus('playing');
    } catch (err) {
      setError(`Failed to load data for theme: ${themeName}`);
      setStatus('failed');
    }
  }, []);

  // 3. 게임 리셋
  const resetGame = useCallback(() => {
    setSelectedTheme(null);
    setGameData(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    themes,
    selectedTheme,
    gameData,
    status,
    error,
    handleThemeSelect,
    resetGame
  };
};
