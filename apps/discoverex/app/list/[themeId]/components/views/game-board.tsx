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

interface LayerForm extends LayerItem, LayerDetails {}

interface GameBoardProps {
  theme: string;
  manifest: Manifest;
  layerItems: LayerItem[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ theme, manifest, layerItems }) => {
  const { background_img, answers } = manifest;
  const [lotties, setLotties] = useState<LayerForm[]>([]);
  const [back, setBack] = useState<string>('');
  const [, setPlayingId] = useState<string | null>(null); // 현재 재생 중인 Lottie ID
  const router = useRouter();
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    // 1. .lottie 및 .json 파일 필터링
    const layerForms = layerItems.filter((e) => e.name.includes('.lottie') || e.name.includes('.json'));

    // 2. fetch 없이 URL 매핑만 수행 (PK... 에러 방지 핵심)
    const tempAssets: LayerForm[] = answers
      .map((e) => {
        const target = layerForms.find((x) => x.name.includes(e.src.split('.')[0]));
        if (target) {
          return {
            ...target,
            lottie_id: e.lottie_id,
            bbox: e.bbox,
            order: e.order,
          };
        }
        return null;
      })
      .filter((asset): asset is LayerForm => asset !== null);

    // 배경 이미지 설정
    const targetBackUrl = layerItems.find((e) => e.name === background_img.src)?.url;
    if (targetBackUrl) setBack(targetBackUrl);

    setLotties(tempAssets.sort((a, b) => a.order - b.order));
  }, [answers, layerItems, background_img.src]);

  useEffect(() => {
    lotties.forEach(async (asset) => {
      if (!blobUrls[asset.url]) {
        const res = await fetch(asset.url);
        const blob = await res.blob();
        // 강제로 dotlottie 타입 지정
        const typedBlob = new Blob([blob], { type: 'application/dotlottie' });
        const newUrl = URL.createObjectURL(typedBlob);
        setBlobUrls((prev) => ({ ...prev, [asset.url]: newUrl }));
      }
    });
  }, [lotties]);

  // 클릭 핸들러: 재생 중이면 멈추고 새로 시작하거나, 해당 ID 저장
  const handleLottieClick = (id: string) => {
    setPlayingId(null); // 초기화 후
    setTimeout(() => setPlayingId(id), 10); // 미세한 지연으로 다시 재생 트리거
  };

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

        {/* Lottie 레이어들 */}
        {lotties.map((lottie) => (
          <div
            key={lottie.lottie_id}
            className="border-2 border-red-500/50 transition-colors"
            onClick={() => handleLottieClick(lottie.lottie_id)}
            style={{
              position: 'absolute',
              left: `${(lottie.bbox.x / background_img.width) * 100}%`,
              top: `${(lottie.bbox.y / background_img.height) * 100}%`,
              width: `${(lottie.bbox.w / background_img.width) * 100}%`,
              height: `${(lottie.bbox.h / background_img.height) * 100}%`,
              cursor: 'pointer',
              zIndex: 20,
            }}
          >
            <DotLottieReact
              src={blobUrls[lottie.url] || lottie.url} // 변환된 Blob URL 사용
              // autoplay={playingId === lottie.lottie_id}
              loop={false}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
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
