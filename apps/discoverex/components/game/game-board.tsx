'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { PlayableLayer, LayerItem, DeliveryBundle, Region } from '../../types/game';
import { getLayerImageUrl } from '../../utils/image-mapping';

interface GameBoardProps {
  bundle: DeliveryBundle;
  availableLayers: LayerItem[];
  foundIds: string[];
  onCorrectClick: (clientX: number, clientY: number, rect: DOMRect) => boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  bundle, 
  availableLayers,
  foundIds,
  onCorrectClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: originalWidth, height: originalHeight, layers } = bundle.playable;

  // 1. 레이어 필터링 및 정렬
  const targetLayers = layers
    .filter(l => l.type === 'base' || l.type === 'inpaint_patch')
    .sort((a, b) => {
      if (a.type === 'base') return -1;
      if (b.type === 'base') return 1;
      return (a.z_index || 0) - (b.z_index || 0);
    });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      onCorrectClick(e.clientX, e.clientY, containerRef.current.getBoundingClientRect());
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full max-w-[768px] aspect-square bg-zinc-200 overflow-hidden rounded-3xl shadow-2xl border-8 border-white dark:border-zinc-800 cursor-crosshair"
      style={{
        aspectRatio: `${originalWidth} / ${originalHeight}`
      }}
    >
      {/* 이미지 레이어들 */}
      {targetLayers.map((layer) => {
        const url = getLayerImageUrl(layer, availableLayers);
        if (!url) return null;

        const isBase = layer.type === 'base';
        const zIndex = isBase ? 0 : (layer.z_index || 10);
        
        const style: React.CSSProperties = isBase 
          ? { zIndex, width: '100%', height: '100%', left: 0, top: 0 }
          : {
              zIndex,
              left: `${(layer.bbox!.x / originalWidth) * 100}%`,
              top: `${(layer.bbox!.y / originalHeight) * 100}%`,
              width: `${(layer.bbox!.w / originalWidth) * 100}%`,
              height: `${(layer.bbox!.h / originalHeight) * 100}%`,
            };

        return (
          <div
            key={layer.layer_id}
            className="absolute pointer-events-none select-none"
            style={style}
          >
            <Image
              src={url}
              alt={layer.layer_id}
              fill
              priority={isBase}
              className={isBase ? "object-cover" : "object-contain"}
              crossOrigin="anonymous"
              draggable={false}
            />
          </div>
        );
      })}

      {/* 찾은 정답 강조 표시 (마커) */}
      {bundle.answer_key.regions
        .filter(r => foundIds.includes(r.region_id))
        .map((region) => (
          <div
            key={`marker-${region.region_id}`}
            className="absolute border-4 border-green-500 rounded-full animate-in zoom-in-50 duration-300 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
            style={{
              zIndex: 1000,
              left: `${(region.bbox.x / originalWidth) * 100}%`,
              top: `${(region.bbox.y / originalHeight) * 100}%`,
              width: `${(region.bbox.w / originalWidth) * 100}%`,
              height: `${(region.bbox.h / originalHeight) * 100}%`,
            }}
          />
        ))}
    </div>
  );
};
