'use client';

import React, { useState, useMemo } from 'react';
import { GameMetadata, Region, LayerItem, LayerListResponse } from '../../types/game';
import { GameBoard } from './game-board';
import { ItemList } from './item-list';

interface GameContainerProps {
  metadata: GameMetadata;
  layersResponse: LayerListResponse;
  onAllFound?: () => void;
  onCorrect?: (id: string) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  metadata,
  layersResponse,
  onAllFound,
  onCorrect
}) => {
  const [foundIds, setFoundIds] = useState<string[]>([]);

  // 1. 레이어 URL 매핑 (metadata의 layer_id 또는 image_ref -> 서명된 URL)
  // 레이어 목록의 'name'에 'layer-id'가 포함되어 있는지 확인하여 매핑합니다.
  const getImageUrl = (layer: LayerItem): string => {
    const layerFileName = layer.image_ref.split('/').pop() || '';
    const matched = layersResponse.data.layers.find(l => l.name === layerFileName);
    return matched ? matched.url : layer.image_ref; // 매칭 안되면 원래 값(fallback)
  };

  // 2. 하단 목록 아이템 URL 매핑 (Region의 object_image_ref -> URL)
  const getThumbnailUrl = (region: Region): string => {
    const fileName = region.attributes.object_image_ref.split('/').pop() || '';
    const matched = layersResponse.data.layers.find(l => l.name === fileName);
    return matched ? matched.url : region.attributes.object_image_ref;
  };

  const handleCorrect = (id: string) => {
    if (foundIds.includes(id)) return;
    
    const newFoundIds = [...foundIds, id];
    setFoundIds(newFoundIds);
    onCorrect?.(id);

    // 모든 정답(answer)을 찾았는지 확인
    const totalAnswers = metadata.answer.answer_region_ids.length;
    if (newFoundIds.length === totalAnswers) {
      onAllFound?.();
    }
  };

  const targetRegions = useMemo(() => {
    return metadata.regions.filter(r => metadata.answer.answer_region_ids.includes(r.region_id));
  }, [metadata]);

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between w-full max-w-[768px] px-2">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Progress</span>
          <div className="text-3xl font-black tabular-nums">
            {foundIds.length} <span className="text-zinc-300">/</span> {targetRegions.length}
          </div>
        </div>
        
        {foundIds.length === targetRegions.length && (
          <div className="px-4 py-2 bg-green-500 text-white font-bold rounded-full animate-bounce shadow-lg">
            🎉 MISSION COMPLETE!
          </div>
        )}
      </div>

      <GameBoard 
        metadata={metadata}
        foundIds={foundIds}
        onCorrectAnswer={handleCorrect}
        getImageUrl={getImageUrl}
      />

      <ItemList 
        items={targetRegions}
        foundIds={foundIds}
        getThumbnailUrl={getThumbnailUrl}
      />
    </div>
  );
};
