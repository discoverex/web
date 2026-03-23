'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { BBox, LayerItem, Manifest } from '@/types/game';
import { useRouter } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LayerDetails {
  lottie_id: string;
  bbox: BBox;
  order: number;
}

interface GameAsset extends LayerDetails {
  lottieUrl: string;
  pngUrl: string;
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
  blobUrl?: string;
  backgroundWidth: number;
  backgroundHeight: number;
}

const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  playingId,
  onPlay,
  onComplete,
  blobUrl,
  backgroundWidth,
  backgroundHeight,
}) => {
  const isPlaying = playingId === asset.lottie_id;

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
        zIndex: 20,
      }}
    >
      {/* Lottie 애니메이션 (재생 중일 때만 표시) */}
      {isPlaying && (
        <DotLottieReact
          src={blobUrl || asset.lottieUrl}
          autoplay
          loop={false}
          dotLottieRefCallback={(dotLottie) => {
            if (dotLottie) {
              dotLottie.addEventListener('complete', onComplete);
            }
          }}
          style={{ width: '100%', height: '100%' }}
        />
      )}

      {/* PNG 이미지 (재생 중이 아닐 때만 표시) */}
      {!isPlaying && (
        <Image src={asset.pngUrl} alt={asset.name} fill crossOrigin="anonymous" className="object-contain" />
      )}
    </div>
  );
};

export const GameBoard: React.FC<GameBoardProps> = ({ theme, manifest, layerItems }) => {
  const { background_img, answers } = manifest;
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [back, setBack] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const router = useRouter();
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const lottieLayerForms = layerItems.filter((e) => e.name.includes('.lottie') || e.name.includes('.json'));
    const pngLayerForms = layerItems.filter((e) => e.name.includes('.png'));

    const combinedAssets: GameAsset[] = answers
      .map((e) => {
        const lottieTarget = lottieLayerForms.find((x) => x.name.includes(e.src.split('.')[0]));
        const pngTarget = pngLayerForms.find((x) => x.name === e.src);

        if (lottieTarget && pngTarget) {
          return {
            lottie_id: e.lottie_id,
            bbox: e.bbox,
            order: e.order,
            lottieUrl: lottieTarget.url,
            pngUrl: pngTarget.url,
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
      if (!blobUrls[asset.lottieUrl]) {
        try {
          const res = await fetch(asset.lottieUrl);
          const blob = await res.blob();
          const typedBlob = new Blob([blob], { type: 'application/dotlottie' });
          const newUrl = URL.createObjectURL(typedBlob);
          setBlobUrls((prev) => ({ ...prev, [asset.lottieUrl]: newUrl }));
        } catch (error) {
          console.error('Failed to load lottie:', asset.lottieUrl, error);
        }
      }
    });
  }, [assets]);

  return (
    <div className="p-4 flex justify-center gap-6 flex-row flex-wrap bg-gray-200 dark:bg-black rounded-lg w-full overflow-hidden relative cursor-pointer">
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

        {/* 정답 아이템 레이어들 (PNG + Lottie) */}
        {assets.map((asset) => (
          <AssetItem
            key={asset.lottie_id}
            asset={asset}
            playingId={playingId}
            onPlay={(id) => setPlayingId(id)}
            onComplete={() => setPlayingId(null)}
            blobUrl={blobUrls[asset.lottieUrl]}
            backgroundWidth={background_img.width}
            backgroundHeight={background_img.height}
          />
        ))}
      </div>

      {/* 우측 정답 리스트 (UI 예시) */}
      <div className="px-6 min-w-[150px] flex flex-col gap-2">
        <span className="font-bold text-2xl w-full text-center my-4">{theme}</span>
        <button
          className="btn btn-md px-4 py-2 bg-white dark:bg-zinc-800 rounded-md shadow transition-colors"
          onClick={() => router.push('/list')}
        >
          ← back to list
        </button>
        <h3 className="font-bold border-b pb-1 mt-6 mb-2">Answers</h3>
        {manifest.answers.map((a) => (
          <span key={a.prompt} className="text-sm opacity-80">
            • {a.prompt}
          </span>
        ))}
      </div>
    </div>
  );
};
