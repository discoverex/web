'use client';

import React from 'react';
import { LayerListResponse } from '../../types/game';
import { GameBoard } from './game-board';
import { useDiscoverGame } from '../../hooks/use-discover-game';
import { getImageUrl, getThumbnailUrl } from '../../utils/image-mapping';

interface GameContainerProps {
  gameData: LayerListResponse['data'];
  onAllFound?: () => void;
  onCorrect?: (id: string) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  gameData,
  onAllFound,
  onCorrect
}) => {
  const { 
    foundIds, 
    handleCorrect, 
    answerRegions, 
    progress, 
    bundle 
  } = useDiscoverGame({ gameData, onCorrect, onAllFound });

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between w-full max-w-[768px] px-2">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Progress</span>
          <div className="text-3xl font-black tabular-nums">
            {progress.found} <span className="text-zinc-300">/</span> {progress.total}
          </div>
        </div>
      </div>

      <GameBoard 
        bundle={bundle}
        foundIds={foundIds}
        onCorrectAnswer={handleCorrect}
        getImageUrl={(layer) => getImageUrl(layer, gameData.layers, gameData.manifest)}
      />

      <div className="w-full mt-8 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 text-center">
          Find these hidden objects
        </h3>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {answerRegions.map((region) => {
            const isFound = foundIds.includes(region.region_id);
            const thumbUrl = getThumbnailUrl(region.region_id, gameData);

            return (
              <div
                key={region.region_id}
                className={`relative group transition-all duration-300 ${isFound ? 'opacity-30 grayscale scale-90' : 'hover:scale-110'}`}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 p-2 rounded-xl bg-white dark:bg-zinc-800 border-2 ${isFound ? 'border-green-500 bg-green-50' : 'border-zinc-100 dark:border-zinc-700'}`}>
                  {thumbUrl ? (
                    <img 
                      src={thumbUrl} 
                      alt="target" 
                      className="w-full h-full object-contain" 
                      crossOrigin="anonymous" 
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center text-[10px] text-zinc-300">
                      ?
                    </div>
                  )}
                </div>
                {isFound && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-lg animate-in zoom-in-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
