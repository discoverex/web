'use client';

import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CATEGORIES = ['dinosaur', 'elephant', 'guitar', 'rocket'];

interface ImageData {
  name: string;
  url: string;
}

export default function MagicEyeGame() {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImageData, setSelectedImageData] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 카테고리가 변경될 때마다 이미지 목록 불러오기
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      setSelectedImageData(null); 
      
      try {
        const prefix = `magic-eye/${selectedCategory}`;
        // 엔드포인트: /media/images-list
        const response = await fetch(`${API_BASE_URL}/media/images-list?prefix=${prefix}`);
        
        if (!response.ok) throw new Error(`${selectedCategory} 목록을 불러오는데 실패했습니다.`);
        
        const json = await response.json();
        
        // 응답 스키마: { status: "success", data: [{name, url}, ...], message: "..." }
        if (json.status === 'success' && Array.isArray(json.data)) {
          const filtered = json.data.filter((item: ImageData) => item.name.includes('prob'));
          setImages(filtered);
        } else {
          setImages([]);
          if (json.status !== 'success') throw new Error(json.message || '데이터를 가져오는데 실패했습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 에러가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen p-8 font-sans bg-zinc-50 dark:bg-black text-black dark:text-white">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-amber-500">매직아이 숨은 그림 찾기</h1>
        <p className="text-zinc-600 dark:text-zinc-400">카테고리를 선택하고 숨겨진 그림을 찾아보세요!</p>
      </header>

      {/* 카테고리 선택 탭 */}
      <nav className="max-w-4xl mx-auto mb-10 flex justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full font-medium transition-all shadow-sm border ${
              selectedCategory === cat
                ? 'bg-amber-500 text-white border-amber-500 scale-105'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-300'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* 왼쪽: 이미지 목록 */}
        <aside className="md:col-span-1 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h2 className="text-lg font-semibold text-amber-500">문제 목록</h2>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">
              {images.length} items
            </span>
          </div>
          
          {loading && <p className="text-sm opacity-70 animate-pulse">데이터 로드 중...</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
          
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {images.length > 0 ? (
              images.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => setSelectedImageData(item)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-[11px] font-mono truncate border ${
                      selectedImageData?.name === item.name
                        ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border-transparent'
                    }`}
                    title={item.name}
                  >
                    {item.name.split('/').pop()}
                  </button>
                </li>
              ))
            ) : (
              !loading && <p className="text-sm opacity-50 italic text-center py-10">해당 카테고리에 'prob' 이미지가 없습니다.</p>
            )}
          </ul>
        </aside>

        {/* 오른쪽: 게임 화면 */}
        <section className="md:col-span-3 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[500px]">
          {selectedImageData ? (
            <div className="w-full">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-sm font-medium">
                  현재 파일: <span className="font-mono text-amber-500">{selectedImageData.name.split('/').pop()}</span>
                </h2>
                <button 
                  onClick={() => setSelectedImageData(null)}
                  className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                >
                  이미지 닫기
                </button>
              </div>
              
              <div className="relative border-4 border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden cursor-crosshair group flex justify-center bg-zinc-200 dark:bg-zinc-950 shadow-inner">
                <img
                  src={selectedImageData.url} 
                  alt="Hidden Object Challenge"
                  className="max-w-full h-auto object-contain max-h-[70vh]"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    console.log(`클릭 좌표 - X: ${Math.round(x)}, Y: ${Math.round(y)}`);
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Load+Error";
                  }}
                />
                <div className="absolute inset-0 pointer-events-none group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="mt-4 flex justify-between items-center text-[11px] opacity-60">
                <span>* 이미지를 클릭하여 숨겨진 요소를 찾아보세요.</span>
                <span className="font-mono">Category: {selectedCategory}</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6 text-7xl animate-bounce">🦖</div>
              <h3 className="text-xl font-medium mb-2">게임을 시작할 준비가 되셨나요?</h3>
              <p className="opacity-50 text-sm">상단 카테고리를 선택한 후, 왼쪽 목록에서 이미지를 클릭하세요.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
