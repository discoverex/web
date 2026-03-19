'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { GameMetadata, LayerItem } from '../../types/game';

interface GameBoardProps {
  metadata: GameMetadata;
  foundIds: string[];
  onCorrectAnswer: (id: string) => void;
  // URL 매핑 함수: metadata의 image_ref 또는 layer_id를 실제 서명된 URL로 변환
  getImageUrl: (item: LayerItem) => string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  metadata, 
  foundIds, 
  onCorrectAnswer,
  getImageUrl
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const originalWidth = metadata.background.width || 768;
  const originalHeight = metadata.background.height || 768;

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 현재 실제 렌더링된 크기 기반으로 클릭 좌표를 원본(768x768) 비율로 변환
    const scaleX = originalWidth / rect.width;
    const scaleY = originalHeight / rect.height;
    
    const x = clickX * scaleX;
    const y = clickY * scaleY;

    // 정답 목록 중 클릭된 bbox가 있는지 확인
    const answerRegions = metadata.regions.filter(r => metadata.answer.answer_region_ids.includes(r.region_id));
    
    for (const region of answerRegions) {
      if (foundIds.includes(region.region_id)) continue;

      const { x: bx, y: by, w, h } = region.geometry.bbox;
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
      {/* 1. 레이어 렌더링 (z-index 순) */}
      {metadata.layers.items
        .sort((a, b) => a.z_index - b.z_index)
        .map((layer) => {
          const isBase = !layer.bbox;
          const url = getImageUrl(layer);
          
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

      {/* 2. 찾은 정답 강조 표시 */}
      {metadata.regions
        .filter(r => foundIds.includes(r.region_id))
        .map((region) => (
          <div
            key={`marker-${region.region_id}`}
            className="absolute border-4 border-green-500 rounded-full animate-in zoom-in-50 duration-300"
            style={{
              zIndex: 2000,
              left: `${(region.geometry.bbox.x / originalWidth) * 100}%`,
              top: `${(region.geometry.bbox.y / originalHeight) * 100}%`,
              width: `${(region.geometry.bbox.w / originalWidth) * 100}%`,
              height: `${(region.geometry.bbox.h / originalHeight) * 100}%`,
            }}
          />
        ))}
    </div>
  );
};
