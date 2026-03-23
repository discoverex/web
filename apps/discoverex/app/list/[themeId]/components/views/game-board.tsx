'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { BBox, LayerItem, Manifest } from '@/types/game';
import { useRouter } from 'next/navigation';
import Lottie from 'react-lottie';
import './game-board.css';

interface LayerDetails {
  lottie_id: string;
  bbox: BBox;
  order: number;
}

interface GameAsset extends LayerDetails {
  lottieUrl: string;
  name: string;
}

interface GameBoardProps {
  theme: string;
  manifest: Manifest;
  layerItems: LayerItem[];
}

interface AssetItemProps {
  asset: GameAsset;
  playingId: string | null;
  onPlay: (id: string) => void;
  onComplete: () => void;
  animationData?: any;
  backgroundWidth: number;
  backgroundHeight: number;
}

const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  playingId,
  onPlay,
  onComplete,
  animationData,
  backgroundWidth,
  backgroundHeight,
}) => {
  const isPlaying = playingId === asset.lottie_id;

  // 로티 애니메이션이 원본 bbox보다 더 넓은 범위를 표현할 수 있도록 확장 비율 설정
  const lottieScale = 4.0;

  const lottieOptions = {
    loop: false,
    autoplay: false, // 기본적으로는 자동 재생 방지
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet',
    },
  };

  const eventListeners = [
    {
      eventName: 'complete' as const,
      callback: onComplete,
    },
  ];

  return (
    <div
      onClick={() => onPlay(asset.lottie_id)}
      style={{
        position: 'absolute',
        left: `${(asset.bbox.x / backgroundWidth) * 100}%`,
        top: `${(asset.bbox.y / backgroundHeight) * 100}%`,
        width: `${(asset.bbox.w / backgroundWidth) * 100}%`,
        height: `${(asset.bbox.h / backgroundHeight) * 100}%`,
        cursor: 'pointer',
        overflow: 'visible',
        zIndex: 20,
      }}
    >
      {/* Lottie 애니메이션 (항상 표시, 클릭 시 재생) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${lottieScale * 100}%`,
          height: `${lottieScale * 100}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', // 클릭은 부모 div(bbox 영역)에서 처리
        }}
      >
        {animationData && (
          <Lottie
            options={{
              ...lottieOptions,
              autoplay: isPlaying,
            }}
            isStopped={!isPlaying}
            eventListeners={eventListeners}
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
};

export const GameBoard: React.FC<GameBoardProps> = ({ theme, manifest, layerItems }) => {
  const { scene_ref, background_img, answers } = manifest;
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [back, setBack] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const router = useRouter();
  const [lottieData, setLottieData] = useState<Record<string, any>>({});

  useEffect(() => {
    const lottieLayerForms = layerItems.filter((e) => e.name.includes('.json'));

    const combinedAssets: GameAsset[] = answers
      .map((e) => {
        const lottieTarget = lottieLayerForms.find((x) => x.name.includes(e.src.split('.')[0]));

        if (lottieTarget) {
          return {
            lottie_id: e.lottie_id,
            bbox: e.bbox,
            order: e.order,
            lottieUrl: lottieTarget.url,
            name: e.src,
          };
        }
        return null;
      })
      .filter((asset): asset is GameAsset => asset !== null);

    const targetBackUrl = layerItems.find((e) => e.name === background_img.src)?.url;
    if (targetBackUrl) setBack(targetBackUrl);

    setAssets(combinedAssets.sort((a, b) => a.order - b.order));
  }, [answers, layerItems, background_img.src]);

  useEffect(() => {
    assets.forEach(async (asset) => {
      if (!lottieData[asset.lottieUrl]) {
        try {
          const res = await fetch(asset.lottieUrl);
          const data = await res.json();
          setLottieData((prev) => ({ ...prev, [asset.lottieUrl]: data }));
        } catch (error) {
          console.error('Failed to load lottie JSON:', asset.lottieUrl, error);
        }
      }
    });
  }, [assets]);

  return (
    <div className="p-4 flex justify-center gap-6 flex-row flex-wrap bg-gray-200 dark:bg-black rounded-lg w-full overflow-hidden relative">
      <div
        style={{
          aspectRatio: `${background_img.width} / ${background_img.height}`,
          maxWidth: `${background_img.width}px`,
        }}
        className="w-full md:w-2/3 lg:w-3/8 h-auto bg-gray-300 dark:bg-zinc-900 rounded-lg overflow-hidden shadow-xl relative"
      >
        {/* 배경 이미지 */}
        {!!back && (
          <Image
            src={back}
            alt={background_img.prompt}
            fill
            sizes="(max-width: 768px) 100vw, 512px"
            crossOrigin="anonymous"
            className="absolute inset-0 object-contain z-0"
          />
        )}

        {/* 정답 아이템 레이어들 (Lottie 전용) */}
        {assets.map((asset) => (
          <AssetItem
            key={asset.lottie_id}
            asset={asset}
            playingId={playingId}
            onPlay={(id) => setPlayingId(id)}
            onComplete={() => setPlayingId(null)}
            animationData={lottieData[asset.lottieUrl]}
            backgroundWidth={background_img.width}
            backgroundHeight={background_img.height}
          />
        ))}
      </div>

      {/* 우측 정답 리스트 (UI 예시) */}
      <div className="px-6 min-w-[150px] w-full sm:w-3/4 lg:w-1/3 flex flex-col gap-2 overflow-visible">
        <span className="font-bold text-2xl w-full text-center my-4">{scene_ref.title}</span>
        <button
          className="btn btn-md px-4 py-2 bg-white dark:bg-zinc-800 rounded-md shadow transition-colors"
          onClick={() => router.push('/list')}
        >
          ← back to list
        </button>
        <h3 className="font-bold border-b pb-1 mt-6 mb-2">Answers</h3>
        {manifest.answers.map((a) => {
          const isActive = playingId === a.lottie_id;
          return (
            <span
              key={a.lottie_id}
              className={`text-sm transition-all duration-300 flex items-center gap-1 ${
                isActive ? 'text-green-500 font-bold' : 'opacity-80'
              }`}
            >
              <span className={isActive ? 'inline-block mr-1' : 'hidden'}>✨</span>
              <span className="mr-1">•</span>
              <span className="flex">
                {a.prompt.split('').map((char, index) => (
                  <span
                    key={index}
                    className={`${isActive ? 'animate-bounce-char' : ''} ${char === ' ' ? 'whitespace-pre' : ''}`}
                    style={isActive ? { animationDelay: `${index * 0.05}s` } : {}}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
