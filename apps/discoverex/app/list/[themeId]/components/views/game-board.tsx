'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { BBox, LayerItem, Manifest } from '@/types/game';
import { useRouter } from 'next/navigation';
import Lottie from 'react-lottie';
import ConfettiEffect from './confetti-effect';
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
  isGameClear: boolean;
}

const getAssetBaseName = (value: string) => {
  const fileName = value.split('/').pop() ?? value;
  return fileName.replace(/\.[^.]+$/, '');
};

const getAssetFileName = (value: string) => value.split('/').pop() ?? value;

const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  playingId,
  onPlay,
  onComplete,
  animationData,
  backgroundWidth,
  backgroundHeight,
  isGameClear,
}) => {
  const isPlaying = playingId === asset.lottie_id;

  const lottieScale = 4.0;

  // 게임 클리어 시 무한 반복 및 자동 재생 옵션 설정
  const lottieOptions = {
    loop: isGameClear,
    autoplay: isGameClear,
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
      onClick={() => !isGameClear && onPlay(asset.lottie_id)}
      style={{
        position: 'absolute',
        left: `${(asset.bbox.x / backgroundWidth) * 100}%`,
        top: `${(asset.bbox.y / backgroundHeight) * 100}%`,
        width: `${(asset.bbox.w / backgroundWidth) * 100}%`,
        height: `${(asset.bbox.h / backgroundHeight) * 100}%`,
        cursor: isGameClear ? 'default' : 'pointer',
        overflow: 'visible',
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${lottieScale * 100}%`,
          height: `${lottieScale * 100}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      >
        {animationData && (
          <Lottie
            key={`${asset.lottie_id}-${isGameClear}`} // 클리어 시 로티 컴포넌트 강제 재마운트 (재생 시작용)
            options={lottieOptions}
            isStopped={!isPlaying && !isGameClear}
            eventListeners={eventListeners}
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
};

// ConfettiEffect 컴포넌트 분리됨

export const GameBoard: React.FC<GameBoardProps> = ({ manifest, layerItems }) => {
  const { scene_ref, background_img, answers } = manifest;
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [back, setBack] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameClear, setIsGameClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const [lottieData, setLottieData] = useState<Record<string, any>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resetGame = useCallback(() => {
    setFoundIds(new Set());
    setScore(0);
    setTimeLeft(60);
    setIsGameClear(false);
    setIsGameOver(false);
    setPlayingId(null);
    setShowConfetti(false);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    const lottieLayerForms = layerItems.filter((e) => e.name.includes('.json'));

    const combinedAssets: GameAsset[] = answers
      .map((e) => {
        const answerBaseName = getAssetBaseName(e.src);
        const lottieTarget = lottieLayerForms.find((x) => getAssetBaseName(x.name) === answerBaseName);

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

    const backgroundFileName = getAssetFileName(background_img.src);
    const targetBackUrl = layerItems.find((e) => getAssetFileName(e.name) === backgroundFileName)?.url;
    if (targetBackUrl) setBack(targetBackUrl);

    setAssets(combinedAssets.sort((a, b) => a.order - b.order));

    startTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [answers, layerItems, background_img.src, startTimer]);

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
  }, [assets, lottieData]);

  // 게임 클리어 체크
  useEffect(() => {
    if (foundIds.size > 0 && foundIds.size === answers.length && !isGameClear) {
      setIsGameClear(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const bonus = timeLeft * 10;
      setScore((prev) => prev + bonus);

      setShowConfetti(true);
      // 폭죽을 반복 재생하기 위해 setTimeout()으로 끄지 않음
    }
  }, [foundIds, answers.length, isGameClear, timeLeft]);

  const handlePlay = useCallback(
    (id: string) => {
      if (playingId || isGameClear || isGameOver) return;

      setPlayingId(id);

      if (!foundIds.has(id)) {
        setFoundIds((prev) => new Set(prev).add(id));
        setScore((prev) => prev + 100);
      }
    },
    [playingId, isGameClear, isGameOver, foundIds],
  );

  return (
    <div className="flex flex-col w-full gap-4 relative">
      <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            timeLeft > 20 ? 'bg-green-500' : timeLeft > 10 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${(timeLeft / 60) * 100}%` }}
        />
      </div>

      <div className="flex justify-center gap-6 flex-row flex-wrap bg-gray-200 dark:bg-black rounded-lg w-full overflow-hidden relative p-4">
        {showConfetti && <ConfettiEffect />}

        <div
          id="game-board"
          style={{
            aspectRatio: `${background_img.width} / ${background_img.height}`,
            maxWidth: `${background_img.width}px`,
          }}
          className={`w-full md:w-2/3 lg:w-3/8 h-auto bg-gray-300 dark:bg-zinc-900 rounded-lg overflow-hidden shadow-xl relative cursor-pointer ${
            playingId || isGameClear ? 'pointer-events-none' : ''
          }`}
        >
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

          {assets.map((asset) => (
            <AssetItem
              key={asset.lottie_id}
              asset={asset}
              playingId={playingId}
              onPlay={handlePlay}
              onComplete={() => setPlayingId(null)}
              animationData={lottieData[asset.lottieUrl]}
              backgroundWidth={background_img.width}
              backgroundHeight={background_img.height}
              isGameClear={isGameClear}
            />
          ))}

          {isGameOver && !isGameClear && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
              <span className="text-white text-4xl font-black animate-pulse">TIME OVER!</span>
            </div>
          )}
        </div>

        <div className="px-6 min-w-[200px] w-full sm:w-3/4 lg:w-1/3 flex flex-col gap-2 overflow-visible">
          <span className="font-bold text-2xl w-full text-center my-4">{scene_ref.title}</span>

          <button
            className={`btn btn-md px-4 py-2 rounded-md shadow transition-all duration-500 ${
              isGameClear
                ? 'bg-linear-to-r from-amber-400 to-orange-500 text-white border-none shadow-orange-500/50 animate-bounce'
                : 'bg-white dark:bg-zinc-800'
            }`}
            onClick={() => router.push('/list')}
          >
            {isGameClear ? '🎉 BACK TO LIST 🎉' : '← back to list'}
          </button>

          <div className="mt-6 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-inner border-2 border-primary/20 flex flex-col items-center">
            <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Score</span>
            <span className="text-3xl font-black text-primary font-mono">{score.toLocaleString()}</span>
            {isGameClear && (
              <span className="text-[10px] text-green-500 font-bold mt-1">
                BONUS +{(timeLeft * 10).toLocaleString()} (Time Left)
              </span>
            )}
          </div>

          <h3 className="font-bold border-b pb-1 mt-6 mb-2 flex justify-between items-center">
            <span>Answers</span>
            <span className="text-xs opacity-50">
              {foundIds.size} / {answers.length}
            </span>
          </h3>

          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-2">
            {manifest.answers.map((a) => {
              const isActive = playingId === a.lottie_id;
              const isFound = foundIds.has(a.lottie_id);
              const shouldDance = isActive || isGameClear;

              return (
                <div
                  key={a.lottie_id}
                  className={`text-sm transition-all duration-300 flex items-center justify-between p-1 rounded ${
                    isFound ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                  }`}
                >
                  <span
                    className={`flex items-center gap-1 ${shouldDance ? 'text-green-500 font-bold' : isFound ? 'text-green-600 dark:text-green-400' : 'opacity-80'}`}
                  >
                    {shouldDance ? (
                      <span className="animate-bounce">✨</span>
                    ) : isFound ? (
                      <span>•</span>
                    ) : (
                      <span className="opacity-30">•</span>
                    )}
                    <span className="flex">
                      {a.prompt
                        .split(', ')[1]
                        .split('')
                        .map((char, index) => (
                          <span
                            key={index}
                            className={`${shouldDance ? 'animate-bounce-char' : ''} ${char === ' ' ? 'whitespace-pre' : ''}`}
                            style={shouldDance ? { animationDelay: `${index * 0.05}s` } : {}}
                          >
                            {char}
                          </span>
                        ))}
                    </span>
                  </span>
                  {isFound && <span className="text-green-500 animate-in zoom-in duration-300">✅</span>}
                </div>
              );
            })}
          </div>

          {(isGameClear || isGameOver) && (
            <button
              className="btn btn-outline btn-primary mt-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500"
              onClick={resetGame}
            >
              🔄 Replay Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
