'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { DeliveryBundle, PlayableLayer } from '../../types/game';

interface GameBoardProps {
  bundle: DeliveryBundle;
  foundIds: string[];
  onCorrectAnswer: (id: string) => void;
  getImageUrl: (item: PlayableLayer) => string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  bundle, 
  foundIds, 
  onCorrectAnswer,
  getImageUrl
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const originalWidth = bundle.playable.width || 768;
  const originalHeight = bundle.playable.height || 768;

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = originalWidth / rect.width;
    const scaleY = originalHeight / rect.height;
    
    const x = clickX * scaleX;
    const y = clickY * scaleY;

    const answerRegions = bundle.answer_key.regions;
    for (const region of answerRegions) {
      if (foundIds.includes(region.region_id)) continue;
      const { x: bx, y: by, w, h } = region.bbox;
      if (x >= bx && x <= bx + w && y >= by && y <= by + h) {
        onCorrectAnswer(region.region_id);
        return;
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[768px] aspect-square bg-zinc-100 overflow-hidden rounded-xl shadow-xl cursor-crosshair border border-zinc-200"
      onClick={handleBoardClick}
    >
      {/* 레이어 렌더링 */}
      {bundle.playable.layers
        .sort((a, b) => a.z_index - b.z_index)
        .map((layer) => {
          const url = getImageUrl(layer);
          
          // 매핑 실패 시 렌더링 건너뜀 (중요: /tmp/ 경로 에러 방지)
          if (!url) return null;

          const isBase = !layer.bbox;
          return (
            <div
              key={layer.layer_id}
              className="absolute pointer-events-none"
              style={{
                zIndex: layer.z_index,
                left: isBase ? 0 : `${(layer.bbox!.x / originalWidth) * 100}%`,
                top: isBase ? 0 : `${(layer.bbox!.y / originalHeight) * 100}%`,
                width: isBase ? '100%' : `${(layer.bbox!.w / originalWidth) * 100}%`,
                height: isBase ? '100%' : `${(layer.bbox!.h / originalHeight) * 100}%`,
              }}
            >
              <Image
                src={url}
                alt={layer.layer_id}
                fill
                priority={layer.type === 'base'}
                className={isBase ? "object-cover" : "object-contain"}
                crossOrigin="anonymous"
              />
            </div>
          );
        })}

      {/* 찾은 정답 강조 표시 */}
      {bundle.answer_key.regions
        .filter(r => foundIds.includes(r.region_id))
        .map((region) => (
          <div
            key={`marker-${region.region_id}`}
            className="absolute border-4 border-green-500 rounded-full animate-in zoom-in-50 duration-300"
            style={{
              zIndex: 2000,
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
