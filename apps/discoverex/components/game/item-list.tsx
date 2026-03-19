'use client';

import React from 'react';
import { Region, LayerListResponse } from '../../types/game';
interface ItemListProps {
  items: Region[];
  foundIds: string[];
  gameData: LayerListResponse['data'];
}

export const ItemList: React.FC<ItemListProps> = ({ 
  items, 
  foundIds,
  gameData
}) => {
  return (
    <div className="w-full mt-12 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-6">
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
        Target Artifacts
      </h3>
      
      <div className="flex flex-wrap gap-6 justify-center">
        {items.map((region) => {
          const isFound = foundIds.includes(region.region_id);
          // 썸네일 매핑 로직 (이미지 매핑 유틸 활용)
          const thumbLayer = gameData.manifest.delivery_bundle.playable.layers.find(
            l => l.source_region_id === region.region_id
          );
          
          let thumbUrl = '';
          if (thumbLayer) {
            const matched = gameData.layers.find(l => 
              l.name.toLowerCase().includes(thumbLayer.image_ref.split('/').pop()?.toLowerCase() || '')
            );
            if (matched) thumbUrl = matched.url;
          }
          
          return (
            <div
              key={region.region_id}
              className={`relative transition-all duration-500 ${
                isFound ? 'opacity-30 grayscale scale-90' : 'hover:scale-110'
              }`}
            >
              <div className={`w-20 h-20 p-3 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-800 border-2 transition-colors ${
                isFound ? 'border-green-500' : 'border-zinc-100 dark:border-zinc-700'
              }`}>
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt="Target"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-black text-zinc-300 italic">
                    ?
                  </div>
                )}
              </div>

              {isFound && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg animate-in zoom-in-50">
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
  );
};
