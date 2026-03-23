'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { BBox, LayerItem, Manifest } from '@/types/game';
import { useRouter } from 'next/navigation';

interface LayerDetails {
  layer_id: string;
  type: 'base' | 'inpaint_patch' | 'composite' | 'fx_overlay';
  bbox: BBox;
  order: number;
}

type LayerForm = LayerItem & LayerDetails;

interface GameBoardProps {
  manifest: Manifest;
  layerItems: LayerItem[];
  lottie: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ manifest, layerItems, lottie }) => {
  const { playable, answer_key } = manifest;
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const [assets, setAssets] = useState<LayerForm[]>([]);
  const router = useRouter();

  const handleClick = () => {
    if (lottieRef.current) {
      // 2. 클릭 시 애니메이션 재생
      // 처음부터 다시 재생하고 싶다면 .stop() 후 .play()를 호출하세요.
      lottieRef.current.play();
    }
  };

  useEffect(() => {
    const layerForms: any[] = [...layerItems];
    const tempAssets: LayerForm[] = [];

    playable.layers.forEach((e) => {
      let target = layerForms.find((x: any) => x.name.includes(e.layer_id));
      if (target) {
        target = {
          ...target,
          layer_id: e.layer_id,
          type: e.type,
          bbox: e.bbox,
          order: e.order,
        };
        tempAssets.push(target);
      }
    });

    const targetAssets = tempAssets
      .sort((a, b) => a.order - b.order)
      .filter((l) => l.type === 'inpaint_patch' || l.type === 'base');

    setAssets(targetAssets);
  }, [playable.layers, layerItems]);

  return (
    <div className="p-4 flex justify-center items-center flex-col bg-gray-200 dark:bg-black rounded-lg w-full h-full relative overflow-hidden relative">
      <div
        ref={containerRef}
        className="p-4 flex justify-center items-center bg-gray-200 dark:bg-black rounded-lg w-full max-w-[512px] aspect-square relative overflow-hidden cursor-pointer"
      >
        <div className="relative w-full h-full">
          {assets.map((l) => (
            <div
              key={l.layer_id}
              className={l.type === 'base' ? 'relative w-full h-full' : 'absolute'}
              style={
                l.type === 'inpaint_patch'
                  ? {
                      left: `${(l.bbox.x / playable.width) * 100}%`,
                      top: `${(l.bbox.y / playable.height) * 100}%`,
                      width: `${(l.bbox.w / playable.width) * 100}%`,
                      height: `${(l.bbox.h / playable.height) * 100}%`,
                    }
                  : {}
              }
            >
              <Image src={l.url} alt={l.name} fill className="object-contain" crossOrigin="anonymous" />
            </div>
          ))}
        </div>
      </div>
      <span>{manifest.playable.goal_text}</span>
      <button className="absolute top-5 left-5 btn btn-md" onClick={() => router.push('/list')}>
        ← back to list
      </button>
    </div>
  );
};
