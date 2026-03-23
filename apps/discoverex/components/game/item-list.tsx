'use client';

import React from 'react';
import Image from 'next/image';
import { Region } from '@/types/game';

interface ItemListProps {
  items: Region[];
  foundIds: string[];
  // 이미지 URL 변환 함수 (GCS 서명된 URL 등)
  getThumbnailUrl: (region: Region) => string;
}

export const ItemList: React.FC<ItemListProps> = ({ items, foundIds, getThumbnailUrl }) => {
  return (
    <div className="w-full mt-8 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 text-center">
        Find these hidden objects
      </h3>

      <div className="flex flex-wrap gap-4 justify-center items-center">
        {items.map((region) => {
          const isFound = foundIds.includes(region.region_id);
          const url = getThumbnailUrl(region);

          return (
            <div
              key={region.region_id}
              className={`relative group transition-all duration-300 ${
                isFound ? 'opacity-30 grayscale scale-90' : 'hover:scale-110 hover:-translate-y-1'
              }`}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 p-2 rounded-xl bg-white dark:bg-zinc-800 border-2 shadow-sm transition-colors ${
                  isFound ? 'border-green-500 bg-green-50' : 'border-zinc-100 dark:border-zinc-700'
                }`}
              >
                <div className="relative w-full h-full">
                  <Image src={url} alt="Target object" fill className="object-contain" crossOrigin="anonymous" />
                </div>
              </div>

              {isFound && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-lg animate-in zoom-in-50">
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
