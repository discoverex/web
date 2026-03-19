import { useState, useMemo, useCallback } from 'react';
import { LayerListResponse } from '../types/game';

interface UseDiscoverGameProps {
  gameData: LayerListResponse['data'];
  onCorrect?: (id: string) => void;
  onAllFound?: () => void;
}

export const useDiscoverGame = ({ 
  gameData, 
  onCorrect, 
  onAllFound 
}: UseDiscoverGameProps) => {
  const [foundIds, setFoundIds] = useState<string[]>([]);
  
  const bundle = gameData.manifest.delivery_bundle;
  const totalItems = bundle.answer_key.answer_region_ids.length;
  
  const handleCorrect = useCallback((id: string) => {
    if (foundIds.includes(id)) return;
    
    const newFoundIds = [...foundIds, id];
    setFoundIds(newFoundIds);
    onCorrect?.(id);

    if (newFoundIds.length === totalItems) {
      onAllFound?.();
    }
  }, [foundIds, onCorrect, onAllFound, totalItems]);

  const answerRegions = useMemo(() => {
    return bundle.answer_key.regions || [];
  }, [bundle]);

  const progress = useMemo(() => ({
    found: foundIds.length,
    total: totalItems
  }), [foundIds, totalItems]);

  return {
    foundIds,
    handleCorrect,
    answerRegions,
    progress,
    bundle
  };
};
