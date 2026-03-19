import { useState, useCallback, useMemo } from 'react';
import { DeliveryBundle, Region } from '../types/game';
import { isPointInBBox, getScaledCoordinates } from '../utils/coordinate-utils';

interface UseDiscoverGameProps {
  bundle: DeliveryBundle;
  onCorrect?: (id: string) => void;
  onAllFound?: () => void;
}

export const useDiscoverGame = ({ 
  bundle, 
  onCorrect, 
  onAllFound 
}: UseDiscoverGameProps) => {
  const [foundIds, setFoundIds] = useState<string[]>([]);
  
  const { width, height } = bundle.playable;
  const answerRegions = bundle.answer_key.regions;
  const totalItems = bundle.answer_key.answer_region_ids.length;

  const handleBoardClick = useCallback((
    clientX: number, 
    clientY: number, 
    rect: DOMRect
  ) => {
    // 1. 클릭 좌표 변환
    const { x, y } = getScaledCoordinates(clientX, clientY, rect, width, height);

    // 2. 정답 영역 충돌 검사
    for (const region of answerRegions) {
      if (foundIds.includes(region.region_id)) continue;

      if (isPointInBBox(x, y, region.bbox)) {
        const newFoundIds = [...foundIds, region.region_id];
        setFoundIds(newFoundIds);
        onCorrect?.(region.region_id);

        if (newFoundIds.length === totalItems) {
          onAllFound?.();
        }
        return true; // 정답 발견
      }
    }
    return false; // 오답
  }, [width, height, answerRegions, foundIds, onCorrect, onAllFound, totalItems]);

  const progress = useMemo(() => ({
    found: foundIds.length,
    total: totalItems
  }), [foundIds, totalItems]);

  return {
    foundIds,
    handleBoardClick,
    progress,
    answerRegions
  };
};
