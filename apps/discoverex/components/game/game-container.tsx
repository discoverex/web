'use client';

import React, { useState, useMemo } from 'react';
import { LayerListResponse, PlayableLayer } from '../../types/game';
import { GameBoard } from './game-board';

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
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const { manifest, layers } = gameData;
  const bundle = manifest.delivery_bundle;

  // 1. 레이어 URL 매핑 (더욱 유연한 매칭 알고리즘)
  const getImageUrl = (layer: PlayableLayer): string => {
    const targetId = layer.layer_id.toLowerCase();
    const shortId = targetId.replace('layer-', '');

    // A. 레이어 ID 기반 매칭 (가장 정확함)
    // 예: "layer-fx-final" -> "004-layer-fx-final.png"
    const matchedById = layers.find(l => {
      const name = l.name.toLowerCase();
      return name.includes(targetId) || name.includes(shortId);
    });
    if (matchedById) return matchedById.url;

    // B. 매니페스트 경로 기반 매칭
    const manifestLayer = manifest.layers?.find(ml => ml.layer_id === layer.layer_id);
    if (manifestLayer) {
      const fileName = manifestLayer.path.split('/').pop()?.toLowerCase() || '';
      if (fileName) {
        const matchedByPath = layers.find(l => l.name.toLowerCase().includes(fileName));
        if (matchedByPath) return matchedByPath.url;
      }
    }

    // C. 원본 image_ref 파일명 기반 매칭 (최후의 수단)
    const refFileName = layer.image_ref.split('/').pop()?.toLowerCase() || '';
    if (refFileName && !refFileName.includes('tmp')) {
      const matchedByRef = layers.find(l => l.name.toLowerCase().includes(refFileName));
      if (matchedByRef) return matchedByRef.url;
    }

    // 모든 매칭 실패 시 빈 문자열 반환 (로컬 경로 /tmp/... 절대 반환 안 함)
    console.warn(`[Discoverex] Mapping failed for layer: ${layer.layer_id}`);
    return '';
  };

  // 2. 썸네일 URL 매핑
  const getThumbnailUrl = (regionId: string): string => {
    const layer = bundle.playable.layers.find(l => l.source_region_id === regionId);
    if (!layer) return '';
    return getImageUrl(layer);
  };

  const handleCorrect = (id: string) => {
    if (foundIds.includes(id)) return;
    
    const newFoundIds = [...foundIds, id];
    setFoundIds(newFoundIds);
    onCorrect?.(id);

    if (newFoundIds.length === bundle.answer_key.answer_region_ids.length) {
      onAllFound?.();
    }
  };

  const answerRegions = useMemo(() => {
    return bundle.answer_key.regions || [];
  }, [bundle]);

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between w-full max-w-[768px] px-2">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Progress</span>
          <div className="text-3xl font-black tabular-nums">
            {foundIds.length} <span className="text-zinc-300">/</span> {bundle.answer_key.answer_region_ids.length}
          </div>
        </div>
      </div>

      <GameBoard 
        bundle={bundle}
        foundIds={foundIds}
        onCorrectAnswer={handleCorrect}
        getImageUrl={getImageUrl}
      />

      <div className="w-full mt-8 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 text-center">
          Find these hidden objects
        </h3>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {answerRegions.map((region) => {
            const isFound = foundIds.includes(region.region_id);
            const thumbUrl = getThumbnailUrl(region.region_id);

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
