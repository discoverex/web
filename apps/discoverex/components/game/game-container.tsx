'use client';

import React from 'react';
import { LayerListResponse } from '../../types/game';
import { GameBoard } from './game-board';
import { ItemList } from './item-list';
import { useDiscoverGame } from '../../hooks/use-discover-game';

interface GameContainerProps {
  gameData: LayerListResponse['data'];
  onCorrect?: (id: string) => void;
  onAllFound?: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ 
  gameData,
  onCorrect,
  onAllFound
}) => {
  const { manifest, layers: availableLayers } = gameData;
  const bundle = manifest.delivery_bundle;

  const {
    foundIds,
    handleBoardClick,
    progress,
    answerRegions
  } = useDiscoverGame({
    bundle,
    onCorrect,
    onAllFound
  });

  if (!bundle) return null;

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* 메인 게임 보드 */}
      <GameBoard 
        bundle={bundle} 
        availableLayers={availableLayers} 
        foundIds={foundIds}
        onCorrectClick={handleBoardClick}
      />
      
      {/* 찾을 아이템 리스트 */}
      <ItemList 
        items={answerRegions} 
        foundIds={foundIds} 
        gameData={gameData}
      />
    </div>
  );
};
